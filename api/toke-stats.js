import { Buffer } from 'node:buffer';
import { fetchTokeLiveMarket, TOKE_MINT, parseU64LE } from './tokeSnapshotShared.js';

const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL ?? 'https://api.mainnet-beta.solana.com';
const JUPITER_TOKEN_SEARCH = 'https://lite-api.jup.ag/tokens/v2/search';
/** Holders need on-chain enumeration + Jupiter can lag; allow RPC time after market snapshot. */
const REQUEST_TIMEOUT_MS = 45000;
const HOLDER_RPC_TIMEOUT_MS = 32000;
const HOLDER_JUPITER_TIMEOUT_MS = 10000;

/**
 * Jupiter token index (same tooling as swaps). Reliable vs public RPC getProgramAccounts (often 429).
 */
async function getHolderCountFromJupiter(signal) {
  const url = `${JUPITER_TOKEN_SEARCH}?query=${encodeURIComponent(TOKE_MINT)}`;
  const res = await fetch(url, {
    signal,
    headers: { Accept: 'application/json' }
  });
  if (!res.ok) {
    return null;
  }
  const data = await res.json();
  if (!Array.isArray(data)) {
    return null;
  }
  const token = data.find((t) => t?.id === TOKE_MINT);
  const n = Number(token?.holderCount);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : null;
}

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

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    // Price / mcap / supply first — must not share fate with heavy holder RPC (often slow or rate-limited).
    const live = await fetchTokeLiveMarket(controller.signal);

    // Jupiter `holderCount` is often stale; prefer on-chain count when RPC succeeds (429/timeout → Jupiter).
    let holderCount = null;
    try {
      const rpcAbort = new AbortController();
      const jupAbort = new AbortController();
      const rpcTimer = setTimeout(() => rpcAbort.abort(), HOLDER_RPC_TIMEOUT_MS);
      const jupTimer = setTimeout(() => jupAbort.abort(), HOLDER_JUPITER_TIMEOUT_MS);

      const [rpcHolders, jupHolders] = await Promise.all([
        getHolderCount(rpcAbort.signal).catch(() => null),
        getHolderCountFromJupiter(jupAbort.signal).catch(() => null)
      ]);
      clearTimeout(rpcTimer);
      clearTimeout(jupTimer);

      if (Number.isFinite(rpcHolders) && rpcHolders >= 0) {
        holderCount = rpcHolders;
      } else if (Number.isFinite(jupHolders) && jupHolders >= 0) {
        holderCount = jupHolders;
      }
    } catch (holderErr) {
      console.error('[toke-stats] holderCount:', holderErr?.message ?? holderErr);
    }

    return res.status(200).json({
      price: live.price,
      marketCap: live.marketCap,
      marketCapSource: live.marketCapSource,
      pairAddress: live.pairAddress,
      totalSupply:
        Number.isFinite(live.totalSupplyUi) && live.totalSupplyUi > 0 ? live.totalSupplyUi : null,
      holderCount: Number.isFinite(holderCount) && holderCount >= 0 ? holderCount : null,
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
