/** Primary Meteora pair linked from the site (Dexscreener). Override via env if the canonical pair moves. */
const DEFAULT_PAIR_ADDRESS = 'Ad6NEGrxHSBAGwfSTtBSHmKQgedHotCJZyFwCgRRAXc9';

/** SPL mint for TOKE (McToken). Must match Jupiter index / on-chain filters. */
export const TOKE_MINT =
  process.env.TOKE_MINT ?? 'AmgUMQeqW8H74trc8UkKjzZWtxBdpS496wh4GLy2mCpo';

const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL ?? 'https://api.mainnet-beta.solana.com';
const DEX_SCREENER_PAIR = 'https://api.dexscreener.com/latest/dex/pairs/solana';
const DEX_SCREENER_TOKEN = 'https://api.dexscreener.com/latest/dex/tokens';

export function parseU64LE(buf, offset = 0) {
  let n = BigInt(0);
  for (let i = 0; i < 8; i++) {
    n |= BigInt(buf[offset + i] ?? 0) << BigInt(8 * i);
  }
  return n;
}

async function rpcRequest(method, params, signal) {
  const response = await fetch(SOLANA_RPC_URL, {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method,
      params
    })
  });

  if (!response.ok) {
    throw new Error(`RPC ${method} failed: HTTP ${response.status}`);
  }

  const payload = await response.json();
  if (payload?.error) {
    throw new Error(`RPC ${method}: ${payload.error.message ?? 'unknown'}`);
  }

  return payload?.result;
}

async function getTotalSupplyUi(mint, signal) {
  const result = await rpcRequest('getTokenSupply', [mint], signal);
  const ui = result?.value?.uiAmount;
  if (typeof ui === 'number' && Number.isFinite(ui) && ui > 0) {
    return ui;
  }
  const str = result?.value?.uiAmountString;
  if (str != null && str !== '') {
    const n = Number(str);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}

function pickPair(payload) {
  if (!payload || typeof payload !== 'object') return null;
  const list = payload.pairs;
  if (Array.isArray(list) && list.length > 0) return list[0];
  if (payload.pair && typeof payload.pair === 'object') return payload.pair;
  return null;
}

function pairLiquidityUsd(pair) {
  const n = Number(pair?.liquidity?.usd);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function isValidDexPair(pair) {
  const priceUsd = Number(pair?.priceUsd);
  return Boolean(pair) && Number.isFinite(priceUsd) && priceUsd > 0;
}

/** When the configured pair is delisted, pick the highest-liquidity USD pair for the mint. */
function pickBestPairFromTokenList(pairs) {
  if (!Array.isArray(pairs) || pairs.length === 0) return null;
  const valid = pairs.filter(isValidDexPair);
  if (valid.length === 0) return null;
  if (valid.length === 1) return valid[0];

  const prices = valid
    .map((p) => Number(p.priceUsd))
    .filter((n) => Number.isFinite(n) && n > 0)
    .sort((a, b) => a - b);
  const median = prices[Math.floor(prices.length / 2)];

  const inBand = valid.filter((p) => {
    const price = Number(p.priceUsd);
    return price >= median * 0.25 && price <= median * 4;
  });
  const pool = inBand.length > 0 ? inBand : valid;

  let best = null;
  let bestLiq = -1;
  for (const p of pool) {
    const liq = pairLiquidityUsd(p);
    if (liq > bestLiq) {
      bestLiq = liq;
      best = p;
    }
  }
  return best;
}

async function fetchDexPairByAddress(pairAddress, signal) {
  const dexUrl = `${DEX_SCREENER_PAIR}/${encodeURIComponent(pairAddress)}`;
  const dexRes = await fetch(dexUrl, {
    signal,
    headers: { Accept: 'application/json' }
  });
  if (!dexRes.ok) {
    throw new Error(`DexScreener HTTP ${dexRes.status}`);
  }
  const dexJson = await dexRes.json();
  return pickPair(dexJson);
}

async function fetchDexBestPairByMint(signal) {
  const dexUrl = `${DEX_SCREENER_TOKEN}/${encodeURIComponent(TOKE_MINT)}`;
  const dexRes = await fetch(dexUrl, {
    signal,
    headers: { Accept: 'application/json' }
  });
  if (!dexRes.ok) {
    throw new Error(`DexScreener token HTTP ${dexRes.status}`);
  }
  const dexJson = await dexRes.json();
  const best = pickBestPairFromTokenList(dexJson?.pairs);
  if (!best) {
    throw new Error('DexScreener token lookup returned no valid pair');
  }
  return best;
}

async function resolveDexPair(signal) {
  const configured = process.env.TOKE_DEX_PAIR_ADDRESS ?? DEFAULT_PAIR_ADDRESS;
  let pair = await fetchDexPairByAddress(configured, signal);
  if (!pair) {
    console.warn(
      `[tokeSnapshotShared] no pair for ${configured}; falling back to token lookup ${TOKE_MINT}`
    );
    pair = await fetchDexBestPairByMint(signal);
  }
  return pair;
}

/**
 * DexScreener pair payloads usually omit holders; we parse common keys if they appear later.
 * Accurate live counts still come from chain RPC in toke-stats when this is null.
 */
function extractDexHolderCount(pair) {
  if (!pair || typeof pair !== 'object') return null;
  const candidates = [
    pair.holders,
    pair.holderCount,
    pair.numHolders,
    pair.uniqueHolders,
    pair.stats?.holders,
    pair.stats?.holderCount,
    pair.info?.holders,
    pair.info?.holderCount
  ];
  for (const c of candidates) {
    if (c == null || c === '') continue;
    const n = Number(c);
    if (Number.isFinite(n) && n >= 0) return Math.round(n);
  }
  return null;
}

/**
 * Live TOKE snapshot: DexScreener for price (+ dex mcap fallback), RPC for supply → price×supply mcap when possible.
 */
export async function fetchTokeLiveMarket(signal) {
  const pair = await resolveDexPair(signal);

  const priceUsd = Number(pair.priceUsd);
  if (!Number.isFinite(priceUsd) || priceUsd <= 0) {
    throw new Error('Invalid priceUsd from DexScreener');
  }

  const dexMarketCap =
    pair.marketCap != null ? Number(pair.marketCap) : Number.NaN;
  const dexFdv = pair.fdv != null ? Number(pair.fdv) : Number.NaN;

  let totalSupplyUi = null;
  try {
    totalSupplyUi = await getTotalSupplyUi(TOKE_MINT, signal);
  } catch (e) {
    console.error('[tokeSnapshotShared] getTokenSupply:', e?.message ?? e);
  }

  let marketCap = null;
  let marketCapSource = null;

  if (Number.isFinite(dexMarketCap) && dexMarketCap > 0) {
    marketCap = dexMarketCap;
    marketCapSource = 'dexscreener';
  } else if (Number.isFinite(dexFdv) && dexFdv > 0) {
    marketCap = dexFdv;
    marketCapSource = 'dexscreener_fdv';
  }

  const dexHolderCount = extractDexHolderCount(pair);

  const h24Raw = pair.priceChange?.h24;
  const h24Num = h24Raw != null && h24Raw !== '' ? Number(h24Raw) : Number.NaN;
  const priceChangeH24 = Number.isFinite(h24Num) ? h24Num : null;

  return {
    price: priceUsd,
    marketCap,
    marketCapSource,
    pairAddress: pair.pairAddress ?? process.env.TOKE_DEX_PAIR_ADDRESS ?? DEFAULT_PAIR_ADDRESS,
    totalSupplyUi,
    dexHolderCount,
    priceChangeH24
  };
}
