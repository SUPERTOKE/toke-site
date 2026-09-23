import { fetchTokeLiveMarket } from '../lib/tokeSnapshotShared.js';
import { fetchOracle } from '../lib/oracleClient.js';
// 2026-09-22: the site's own Upstash *SnapshotsKv delta layer was retired. 24h deltas come solely
// from the canonical /v1/oracle (toke-api Upstash) — deltaSource had read all-'oracle' since 07-13
// and the site Redis was never configured (redisConfigured:false). No site-side KV remains.

/** Canonical TOKE API base (explorer pipeline). Repoint to api.mctoken.xyz/v1 later via env. */
const TOKE_API_BASE = (process.env.TOKE_API_BASE ?? 'https://explorer.mctoken.xyz/api/v1').replace(/\/+$/, '');

// Keep under the Vercel function maxDuration (60s) so the abort fires a clean 502
// before the platform hard-kills the invocation. Holder count comes from a fast TOKE
// API fetch (own 8s abort) + DexScreener, so 30s is ample headroom.
const REQUEST_TIMEOUT_MS = 30000;
/** CDN cache for public stats JSON (pairs with ~30s client poll). */
const STATS_CACHE_CONTROL = 'public, s-maxage=45, stale-while-revalidate=90';

/** Server-side holder count cache — refreshed at most once every 5 minutes. */
const HOLDER_CACHE_TTL_MS = 5 * 60 * 1000;
let holderCache = { count: null, fetchedAt: 0, inFlight: false };

async function getHolderCount(signal) {
  // Source the canonical, reconciled holder count from the TOKE API (the explorer
  // pipeline's Gate-A-verified number) instead of a heavy per-request
  // getProgramAccounts scan. Fast + reliable on serverless, and keeps the site and
  // explorer showing one identical holder number.
  // Prefer _lean_stats.json (rebuilt every ~6h by the explorer pipeline = freshest,
  // matches the explorer's live holder number); token.json is a curated fallback.
  const endpoints = [
    { url: `${TOKE_API_BASE}/_lean_stats.json`, pick: (j) => j?.holders },
    { url: `${TOKE_API_BASE}/token.json`, pick: (j) => j?.data?.holders_count }
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
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    // Staged cutover (API-TOPOLOGY convergence items 4–5): the canonical /v1/oracle is
    // the primary source for price/mcap/liquidity/supply — ONE implementation, zero
    // site-side DexScreener/RPC calls. The legacy DexScreener+RPC path remains as the
    // fallback only when the oracle is unreachable.
    const oracle = await fetchOracle(controller.signal);
    const statsSource = oracle ? 'oracle' : 'fallback';
    const live = oracle
      ? {
          price: oracle.price,
          marketCap: oracle.marketCap,
          marketCapSource: oracle.marketCap != null ? 'oracle' : null,
          pairAddress: oracle.pairAddress,
          totalSupplyUi: oracle.supplyUi,
          supplySource: oracle.supplyUi != null ? 'pipeline' : null,
          supplyAsOf: oracle.asOf,
          priceChangeH24: oracle.priceChangeH24,
          priceChangeH24Source: oracle.priceChangeH24 != null ? 'oracle' : null,
          liquidityUsd: oracle.liquidityUsd,
          liquiditySource: oracle.liquidityUsd != null ? 'oracle' : null
        }
      : await fetchTokeLiveMarket(controller.signal);

    const now = Date.now();
    const cacheAge = now - holderCache.fetchedAt;
    const cacheStale = cacheAge >= HOLDER_CACHE_TTL_MS;

    // Holder count: the oracle already carries the canonical (Gate-A) number.
    if (oracle && Number.isFinite(oracle.holders) && oracle.holders > 0 && cacheStale) {
      onHolderCountResolved(Math.round(oracle.holders));
    } else if (cacheStale && !holderCache.inFlight) {
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

    const resolvedHolders = holderCache.count;

    const price = live.price;
    const supplyUi = live.totalSupplyUi;

    const liquidityUsd =
      live.liquidityUsd != null && Number.isFinite(Number(live.liquidityUsd)) && live.liquidityUsd > 0
        ? Number(live.liquidityUsd)
        : null;

    let avgTokeUi = null;
    if (
      Number.isFinite(supplyUi) &&
      supplyUi > 0 &&
      Number.isFinite(resolvedHolders) &&
      resolvedHolders > 0
    ) {
      avgTokeUi = Math.round((supplyUi / resolvedHolders) * 1000) / 1000;
    }

    // 24h deltas: canonical oracle only (null when the oracle is unreachable or still warming).
    const holderCountChange24h = oracle?.holdersChange24h ?? null;
    const marketCapChangePct24h = oracle?.mcapChangePct24h ?? null;
    const liquidityChangePct24h = oracle?.liquidityChangePct24h ?? null;
    const deltaSource = {
      holders: holderCountChange24h != null ? 'oracle' : null,
      mcap: marketCapChangePct24h != null ? 'oracle' : null,
      liquidity: liquidityChangePct24h != null ? 'oracle' : null
    };

    let avgWalletUsd = null;
    if (
      avgTokeUi != null &&
      Number.isFinite(price) &&
      price > 0
    ) {
      avgWalletUsd = Math.round(avgTokeUi * price * 100) / 100;
    }

    const holderCountFetchedAt = holderCache.fetchedAt ? new Date(holderCache.fetchedAt).toISOString() : null;
    const statsMeta = {
      holderCountFetchedAt,
      holderCountStale: !holderCache.fetchedAt || now - holderCache.fetchedAt >= HOLDER_CACHE_TTL_MS,
      deltaStore: 'oracle'
    };

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
      holderCountFetchedAt,
      statsMeta,
      statsSource,
      deltaSource,
      supplySource: live.supplySource ?? null,
      supplyAsOf: live.supplyAsOf ?? null,
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
