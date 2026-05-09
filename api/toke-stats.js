import { Buffer } from 'node:buffer';
import { fetchTokeLiveMarket, TOKE_MINT, parseU64LE } from './tokeSnapshotShared.js';

const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL ?? 'https://api.mainnet-beta.solana.com';
const BIRDEYE_TOKEN_OVERVIEW = 'https://public-api.birdeye.so/defi/token_overview';

/** Dex fetch + holder RPC + optional Birdeye; no Jupiter for holders. */
const REQUEST_TIMEOUT_MS = 90000;

/** Warm-instance fallback when current holder resolution fails (cold starts have no cache). */
let lastSuccessfulHolderCount = null;

/** Birdeye requires an API key (free tier). Set BIRDEYE_API_KEY on Vercel. */
async function getHolderCountFromBirdeye(signal) {
  const apiKey = process.env.BIRDEYE_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }

  const url = `${BIRDEYE_TOKEN_OVERVIEW}?address=${encodeURIComponent(TOKE_MINT)}`;
  const res = await fetch(url, {
    signal,
    headers: {
      Accept: 'application/json',
      'x-chain': 'solana',
      'X-API-KEY': apiKey
    }
  });

  if (!res.ok) {
    console.error('[toke-stats] Birdeye holders HTTP', res.status);
    return null;
  }

  const json = await res.json();
  if (!json?.success || json?.data == null) {
    return null;
  }

  const n = Number(json.data.holder);
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
    const live = await fetchTokeLiveMarket(controller.signal);

    // 1) DexScreener pair — holders field rarely present.
    // 2) On-chain SPL accounts (public RPC by default).
    // 3) Birdeye if BIRDEYE_API_KEY set.
    let holderCount = null;
    if (Number.isFinite(live.dexHolderCount) && live.dexHolderCount >= 0) {
      holderCount = Math.round(live.dexHolderCount);
    }

    if (holderCount == null) {
      try {
        const holderAbort = new AbortController();
        const holderTimer = setTimeout(() => holderAbort.abort(), 48000);
        holderCount = await getHolderCount(holderAbort.signal);
        clearTimeout(holderTimer);
      } catch (holderErr) {
        console.error('[toke-stats] on-chain holderCount:', holderErr?.message ?? holderErr);
      }
    }

    if (holderCount == null) {
      try {
        const beAbort = new AbortController();
        const beTimer = setTimeout(() => beAbort.abort(), 8000);
        holderCount = await getHolderCountFromBirdeye(beAbort.signal);
        clearTimeout(beTimer);
      } catch (beErr) {
        console.error('[toke-stats] Birdeye holderCount:', beErr?.message ?? beErr);
      }
    }

    let resolvedHolders = holderCount;
    if (Number.isFinite(resolvedHolders) && resolvedHolders >= 0) {
      lastSuccessfulHolderCount = resolvedHolders;
    } else if (lastSuccessfulHolderCount != null) {
      resolvedHolders = lastSuccessfulHolderCount;
    }

    return res.status(200).json({
      price: live.price,
      marketCap: live.marketCap,
      marketCapSource: live.marketCapSource,
      pairAddress: live.pairAddress,
      totalSupply:
        Number.isFinite(live.totalSupplyUi) && live.totalSupplyUi > 0 ? live.totalSupplyUi : null,
      holderCount:
        Number.isFinite(resolvedHolders) && resolvedHolders >= 0 ? resolvedHolders : null,
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
