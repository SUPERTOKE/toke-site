/**
 * GeckoTerminal OHLCV for the canonical TOKE pool — shared by `/api/toke-chart` and live stats.
 */
const DEFAULT_POOL_ADDRESS = 'Ad6NEGrxHSBAGwfSTtBSHmKQgedHotCJZyFwCgRRAXc9';
const WINDOW_H24_SEC = 24 * 60 * 60;
const WINDOW_D7_SEC = 7 * WINDOW_H24_SEC;
const GECKO_BASE = 'https://api.geckoterminal.com/api/v2';
const CACHE_MS = 60_000;

/** module-scope cache (warm serverless instances) */
let cache = { at: 0, payload: null };

export function poolAddress() {
  return process.env.TOKE_DEX_PAIR_ADDRESS ?? DEFAULT_POOL_ADDRESS;
}

function geckoHeaders() {
  return {
    Accept: 'application/json',
    'User-Agent': process.env.GECKOTERMINAL_USER_AGENT ?? 'mctoken.xyz/1.0 (+https://mctoken.xyz)'
  };
}

/**
 * @param {unknown[][]} ohlcvList — [unixSec, open, high, low, close, volume]
 * @param {number} windowSec — only candles at or after (now − windowSec)
 */
export function ohlcvPointsInWindow(ohlcvList, windowSec) {
  const cutoff = Math.floor(Date.now() / 1000) - windowSec;
  const points = [];

  for (const row of ohlcvList ?? []) {
    if (!Array.isArray(row) || row.length < 5) continue;
    const time = Number(row[0]);
    const close = Number(row[4]);
    if (!Number.isFinite(time) || !Number.isFinite(close) || close <= 0) continue;
    if (time < cutoff) continue;
    points.push({ time, value: close });
  }

  points.sort((a, b) => a.time - b.time);

  const deduped = [];
  for (const p of points) {
    const last = deduped[deduped.length - 1];
    if (last && last.time === p.time) {
      deduped[deduped.length - 1] = p;
    } else {
      deduped.push(p);
    }
  }

  return deduped;
}

/** Prefer last 24h; if the pool is new/thin, fall back to 7d so the series still renders. */
export function normalizeOhlcvPoints(ohlcvList) {
  const h24 = ohlcvPointsInWindow(ohlcvList, WINDOW_H24_SEC);
  if (h24.length >= 2) return h24;
  const d7 = ohlcvPointsInWindow(ohlcvList, WINDOW_D7_SEC);
  return d7.length >= 2 ? d7 : h24.length > 0 ? h24 : d7;
}

export function pctChangeFromPoints(points) {
  if (!Array.isArray(points) || points.length < 2) return null;
  const first = points[0].value;
  const last = points[points.length - 1].value;
  if (!Number.isFinite(first) || first <= 0 || !Number.isFinite(last)) return null;
  return ((last - first) / first) * 100;
}

async function fetchGeckoOhlcvRaw(signal) {
  const pool = encodeURIComponent(poolAddress());
  const url =
    `${GECKO_BASE}/networks/solana/pools/${pool}/ohlcv/minute` +
    `?aggregate=5&limit=288&currency=usd`;

  const res = await fetch(url, { signal, headers: geckoHeaders() });
  if (!res.ok) {
    throw new Error(`GeckoTerminal HTTP ${res.status}`);
  }

  const json = await res.json();
  const list = json?.data?.attributes?.ohlcv_list;
  if (!Array.isArray(list) || list.length === 0) {
    throw new Error('GeckoTerminal returned no OHLCV rows');
  }

  return { list, meta: json?.meta ?? {} };
}

/**
 * @returns {Promise<{ points: { time: number, value: number }[], changePct24h: number|null, symbol: string, poolAddress: string, source: string, updatedAt: string }>}
 */
export async function fetchGeckoTokeOhlcv(signal) {
  const now = Date.now();
  if (cache.payload && now - cache.at < CACHE_MS) {
    return cache.payload;
  }

  const { list, meta } = await fetchGeckoOhlcvRaw(signal);
  const points = normalizeOhlcvPoints(list);
  if (points.length === 0) {
    throw new Error('No OHLCV points within the last 7 days');
  }

  const payload = {
    points,
    changePct24h: pctChangeFromPoints(points),
    symbol: meta?.base?.symbol ?? 'TOKE',
    poolAddress: poolAddress(),
    source: 'geckoterminal',
    updatedAt: new Date().toISOString()
  };
  cache = { at: now, payload };
  return payload;
}

export function peekGeckoTokeOhlcvCache() {
  return cache.payload;
}

/** Cached 24h % only — for stats when Dex `priceChange.h24` is missing. */
export async function fetchGeckoTokeChangePct24h(signal) {
  try {
    const payload = await fetchGeckoTokeOhlcv(signal);
    const pct = payload?.changePct24h;
    return pct != null && Number.isFinite(pct) ? pct : null;
  } catch {
    if (cache.payload?.changePct24h != null && Number.isFinite(cache.payload.changePct24h)) {
      return cache.payload.changePct24h;
    }
    return null;
  }
}
