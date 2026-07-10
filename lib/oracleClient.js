// lib/oracleClient.js — canonical TOKE oracle reader (api.mctoken.xyz/v1/oracle).
// Staged cutover: the site's stats functions read the one canonical price/mcap/liquidity
// implementation first and only fall back to the legacy DexScreener+KV path when the
// oracle is unreachable. Never throws — returns null on any failure so callers can
// fall back cleanly. See API-TOPOLOGY.md (convergence items 4–5).

const ORACLE_URL = process.env.TOKE_ORACLE_URL ?? 'https://api.mctoken.xyz/v1/oracle';

/** Module-level cache matched to the oracle's own s-maxage=20. */
const ORACLE_CACHE_MS = 20_000;
let oracleCache = { at: 0, value: null };

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

/**
 * Fetch + normalize the oracle envelope.
 * @returns {Promise<null | {
 *   price:number, priceChangeH24:number|null, liquidityUsd:number|null,
 *   marketCap:number|null, supplyUi:number|null, holders:number|null,
 *   mcapChangePct24h:number|null, liquidityChangePct24h:number|null,
 *   holdersChange24h:number|null, pairAddress:string|null, asOf:string|null
 * }>}
 */
export async function fetchOracle(signal, timeoutMs = 8000) {
  const now = Date.now();
  if (oracleCache.value && now - oracleCache.at < ORACLE_CACHE_MS) {
    return oracleCache.value;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const onOuterAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener('abort', onOuterAbort, { once: true });
  }

  try {
    const r = await fetch(ORACLE_URL, {
      signal: controller.signal,
      headers: { Accept: 'application/json' }
    });
    if (!r.ok) return null;
    const j = await r.json();
    const d = j?.data;
    const price = num(d?.liquidity_weighted_price_usd);
    if (price == null || price <= 0) return null;

    // deepest pool citation, if present, doubles as the "pair" reference
    const topPool = Array.isArray(d?.pools) && d.pools.length > 0 ? d.pools[0] : null;

    const value = {
      price,
      priceChangeH24: num(d?.price_change_h24),
      liquidityUsd: num(d?.total_pool_liquidity_usd),
      marketCap: num(d?.implied_mcap_usd),
      supplyUi: num(d?.supply_used),
      holders: num(d?.holders),
      mcapChangePct24h: num(d?.mcap_change_pct_24h),
      liquidityChangePct24h: num(d?.liquidity_change_pct_24h),
      holdersChange24h: num(d?.holders_change_24h),
      pairAddress: topPool?.cite?.ref ?? null,
      asOf: typeof j?.as_of === 'string' ? j.as_of : null
    };
    oracleCache = { at: now, value };
    return value;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
    if (signal) signal.removeEventListener('abort', onOuterAbort);
  }
}
