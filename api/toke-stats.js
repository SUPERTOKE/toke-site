import { Buffer } from 'node:buffer';
import { fetchTokeLiveMarket, TOKE_MINT, parseU64LE } from './tokeSnapshotShared.js';
import { resolveHolderSnapshotStats, latestRecordedHolderCount } from './holderSnapshotsKv.js';
import { resolveMcapSnapshotStats } from './mcapSnapshotsKv.js';
import { resolveLiquiditySnapshotStats } from './liquiditySnapshotsKv.js';
import { resolveAvgTokeSnapshotStats } from './avgTokeSnapshotsKv.js';
import { getRedis } from './redisClient.js';
import { buildStatsMeta, EMPTY_SNAPSHOT_LIST_META } from './statsMeta.js';
import { SNAPSHOT_RECORD_INTERVAL_MS } from './snapshotKvShared.js';

const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL ?? 'https://api.mainnet-beta.solana.com';

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
  const result = await rpcRequest(
    'getProgramAccounts',
    [
      TOKEN_PROGRAM_ID,
      {
        encoding: 'base64',
        dataSlice: { offset: 32, length: 40 },
        filters: [{ dataSize: 165 }, { memcmp: { offset: 0, bytes: TOKE_MINT } }]
      }
    ],
    signal
  );

  const ownerSet = new Set();

  for (const account of result ?? []) {
    const encodedData = account?.account?.data?.[0];
    if (!encodedData) {
      continue;
    }

    const raw = Buffer.from(encodedData, 'base64');
    if (raw.length < 40) {
      continue;
    }

    const amount = parseU64LE(raw, 32);
    if (amount <= BigInt(0)) {
      continue;
    }

    const ownerHex = raw.subarray(0, 32).toString('hex');
    ownerSet.add(ownerHex);
  }

  return ownerSet.size;
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
      const holderTimer = setTimeout(() => holderAbort.abort(), 48000);

      getHolderCount(holderAbort.signal)
        .then(onHolderCountResolved)
        .catch((err) => {
          console.error('[toke-stats] on-chain holderCount:', err?.message ?? err);
        })
        .finally(() => {
          clearTimeout(holderTimer);
          holderCache.inFlight = false;
        });
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

    let avgWalletUsd = null;
    if (avgTokeUi != null && Number.isFinite(price) && price > 0) {
      avgWalletUsd = Math.round(avgTokeUi * price * 1000) / 1000;
    }

    const avgTokePromise =
      avgWalletUsd != null
        ? resolveAvgTokeSnapshotStats(avgWalletUsd, now, { record: shouldRecordSnapshots })
        : Promise.resolve({ change24h: null, meta: null });

    const [holderSnap, mcapSnap, liquiditySnap, avgTokeSnap] = await Promise.all([
      holderPromise,
      mcapPromise,
      liquidityPromise,
      avgTokePromise
    ]);

    const holderCountChange24h = holderSnap.change24h;
    const marketCapChangePct24h = mcapSnap.changePct24h;
    const liquidityChangePct24h = liquiditySnap.changePct24h;
    const avgTokeChange24h = avgTokeSnap.change24h;

    const statsMeta = buildStatsMeta({
      fetchedAtMs: holderCache.fetchedAt,
      ttlMs: HOLDER_CACHE_TTL_MS,
      redisConfigured: !!getRedis(),
      holderMeta: holderSnap.meta ?? { ...EMPTY_SNAPSHOT_LIST_META },
      mcapMeta: mcapSnap.meta ?? { ...EMPTY_SNAPSHOT_LIST_META },
      liquidityMeta: liquiditySnap.meta ?? { ...EMPTY_SNAPSHOT_LIST_META },
      avgTokeMeta: avgTokeSnap.meta ?? { ...EMPTY_SNAPSHOT_LIST_META },
      holderCountChange24h,
      marketCapChangePct24h,
      liquidityChangePct24h,
      avgTokeChange24h,
      now
    });

    res.setHeader('Cache-Control', STATS_CACHE_CONTROL);
    return res.status(200).json({
      price: live.price,
      marketCap: live.marketCap,
      marketCapSource: live.marketCapSource,
      pairAddress: live.pairAddress,
      priceChangeH24: live.priceChangeH24,
      marketCapChangePct24h,
      liquidityUsd,
      liquiditySource: live.liquiditySource ?? null,
      liquidityChangePct24h,
      avgTokeUi,
      avgWalletUsd,
      avgTokeChange24h,
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
