import { Buffer } from 'node:buffer';
import { fetchTokeLiveMarket, TOKE_MINT, parseU64LE } from '../lib/tokeSnapshotShared.js';
import { resolveHolderSnapshotStats, latestRecordedHolderCount } from '../lib/holderSnapshotsKv.js';
import { resolveMcapSnapshotStats } from '../lib/mcapSnapshotsKv.js';
import { resolveLiquiditySnapshotStats } from '../lib/liquiditySnapshotsKv.js';
import { getRedis } from '../lib/redisClient.js';
import { buildStatsMeta, EMPTY_SNAPSHOT_LIST_META } from '../lib/statsMeta.js';
import { SNAPSHOT_RECORD_INTERVAL_MS } from '../lib/snapshotKvShared.js';

const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL ?? 'https://api.mainnet-beta.solana.com';
/** Canonical TOKE API base (explorer pipeline). Repoint to api.mctoken.xyz/v1 later via env. */
const TOKE_API_BASE = (process.env.TOKE_API_BASE ?? 'https://explorer.mctoken.xyz/api/v1').replace(/\/+$/, '');

const REQUEST_TIMEOUT_MS = 90000;
/** CDN cache for public stats JSON (pairs with ~30s client poll). */
const STATS_CACHE_CONTROL = 'public, s-maxage=45, stale-while-revalidate=90';

/** Server-side holder count cache — refreshed at most once every 5 minutes. */
const HOLDER_CACHE_TTL_MS = 5 * 60 * 1000;
let holderCache = { count: null, fetchedAt: 0, inFlight: false };
let lastSnapshotRecordAt = 0;

async function rpcRequest(method, params, signal) {
  const response = await fetch(SOLANA_RPC_URL, {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method,
      params
    })
  });

  if (!response.ok) {
    throw new Error(`RPC request failed with status ${response.status}`);
  }

  const payload = await response.json();
  if (payload?.error) {
    throw new Error(`RPC error: ${payload.error.message ?? 'Unknown error'}`);
  }

  return payload?.result;
}

async function getHolderCount(signal) {
  // Source the canonical, reconciled holder count from the TOKE API (the explorer
  // pipeline's Gate-A-verified number) instead of a heavy per-request
  // getProgramAccounts scan. Fast + reliable on serverless, and keeps the site and
  // explorer showing one identical holder number.
  const endpoints = [
    { url: `${TOKE_API_BASE}/token.json`, pick: (j) => j?.data?.holders_count },
    { url: `${TOKE_API_BASE}/_lean_stats.json`, pick: (j) => j?.holders }
  ];
  let lastErr = null;
  for (const ep of endpoints) {
    try {
      const r = await fetch(ep.url, { signal, headers: { Accept: 'application/json' } });
      if (!r.ok) {
        lastErr = new Error(`${ep.url} HTTP ${r.status}`);
        continue;
      }
      const j = await r.json();
      const n = Number(ep.pick(j));
      if (Number.isFinite(n) && n > 0) return Math.round(n);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error('TOKE API holder count unavailable');
}

function onHolderCountResolved(count) {
  if (!Number.isFinite(count) || count < 0) return;
  holderCache.count = count;
  holderCache.fetchedAt = Date.now();
  resolveHolderSnapshotStats(count, Date.now(), { record: true }).catch((err) => {
    console.error('[toke-stats] resolveHolderSnapshotStats (RPC):', err?.message ?? err);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const live = await fetchTokeLiveMarket(controller.signal);

    const now = Date.now();
    const cacheAge = now - holderCache.fetchedAt;
    const cacheStale = cacheAge >= HOLDER_CACHE_TTL_MS;

    if (cacheStale && !holderCache.inFlight) {
      holderCache.inFlight = true;
      const holderAbort = new AbortController();
      const holderTimer = setTimeout(() => holderAbort.abort(), 8000);
      // TOKE API is a fast static fetch, so resolve inline (the old fire-and-forget
      // getProgramAccounts never completed on frozen serverless → holders showed "—").
      try {
        const count = await getHolderCount(holderAbort.signal);
        onHolderCountResolved(count);
      } catch (err) {
        console.error('[toke-stats] TOKE API holderCount:', err?.message ?? err);
      } finally {
        clearTimeout(holderTimer);
        holderCache.inFlight = false;
      }
    }

    let resolvedHolders = holderCache.count;
    if (!Number.isFinite(resolvedHolders) || resolvedHolders < 0) {
      resolvedHolders = await latestRecordedHolderCount();
    }

    const shouldRecordSnapshots = now - lastSnapshotRecordAt >= SNAPSHOT_RECORD_INTERVAL_MS;
    if (shouldRecordSnapshots) {
      lastSnapshotRecordAt = now;
    }

    const price = live.price;
    const supplyUi = live.totalSupplyUi;
    let mcapTrack = null;
    if (Number.isFinite(price) && price > 0 && Number.isFinite(supplyUi) && supplyUi > 0) {
      mcapTrack = price * supplyUi;
    } else if (Number.isFinite(live.marketCap) && live.marketCap > 0) {
      mcapTrack = live.marketCap;
    }

    const holderPromise =
      Number.isFinite(resolvedHolders) && resolvedHolders >= 0
        ? resolveHolderSnapshotStats(resolvedHolders, now, {
            record: shouldRecordSnapshots
          })
        : Promise.resolve({ change24h: null, meta: null });

    const mcapPromise =
      mcapTrack != null && Number.isFinite(mcapTrack) && mcapTrack > 0
        ? resolveMcapSnapshotStats(mcapTrack, now, { record: shouldRecordSnapshots })
        : Promise.resolve({ changePct24h: null, meta: null });

    const liquidityUsd =
      live.liquidityUsd != null && Number.isFinite(Number(live.liquidityUsd)) && live.liquidityUsd > 0
        ? Number(live.liquidityUsd)
        : null;

    const liquidityPromise =
      liquidityUsd != null
        ? resolveLiquiditySnapshotStats(liquidityUsd, now, { record: shouldRecordSnapshots })
        : Promise.resolve({ changePct24h: null, meta: null });

    let avgTokeUi = null;
    if (
      Number.isFinite(supplyUi) &&
      supplyUi > 0 &&
      Number.isFinite(resolvedHolders) &&
      resolvedHolders > 0
    ) {
      avgTokeUi = Math.round((supplyUi / resolvedHolders) * 1000) / 1000;
    }

    const [holderSnap, mcapSnap, liquiditySnap] = await Promise.all([
      holderPromise,
      mcapPromise,
      liquidityPromise
    ]);

    const holderCountChange24h = holderSnap.change24h;
    const marketCapChangePct24h = mcapSnap.changePct24h;
    const liquidityChangePct24h = liquiditySnap.changePct24h;

    let avgWalletUsd = null;
    if (
      avgTokeUi != null &&
      Number.isFinite(price) &&
      price > 0
    ) {
      avgWalletUsd = Math.round(avgTokeUi * price * 100) / 100;
    }

    const statsMeta = buildStatsMeta({
      fetchedAtMs: holderCache.fetchedAt,
      ttlMs: HOLDER_CACHE_TTL_MS,
      redisConfigured: !!getRedis(),
      holderMeta: holderSnap.meta ?? { ...EMPTY_SNAPSHOT_LIST_META },
      mcapMeta: mcapSnap.meta ?? { ...EMPTY_SNAPSHOT_LIST_META },
      liquidityMeta: liquiditySnap.meta ?? { ...EMPTY_SNAPSHOT_LIST_META },
      avgTokeMeta: { ...EMPTY_SNAPSHOT_LIST_META },
      holderCountChange24h,
      marketCapChangePct24h,
      liquidityChangePct24h,
      avgTokeChange24h: null,
      now
    });

    res.setHeader('Cache-Control', STATS_CACHE_CONTROL);
    return res.status(200).json({
      price: live.price,
      marketCap: live.marketCap,
      marketCapSource: live.marketCapSource,
      pairAddress: live.pairAddress,
      priceChangeH24: live.priceChangeH24,
      priceChangeH24Source: live.priceChangeH24Source,
      marketCapChangePct24h,
      liquidityUsd,
      liquiditySource: live.liquiditySource ?? null,
      liquidityChangePct24h,
      avgTokeUi,
      avgWalletUsd,
      totalSupply:
        Number.isFinite(live.totalSupplyUi) && live.totalSupplyUi > 0 ? live.totalSupplyUi : null,
      holderCount:
        Number.isFinite(resolvedHolders) && resolvedHolders >= 0 ? resolvedHolders : null,
      holderCountChange24h,
      holderCountFetchedAt: statsMeta.holderCountFetchedAt,
      statsMeta,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    const message =
      error?.name === 'AbortError' ? 'Stats request timed out' : 'Failed to fetch token stats';
    console.error('[toke-stats]', error);
    return res.status(502).json({ error: message });
  } finally {
    clearTimeout(timeout);
  }
}
