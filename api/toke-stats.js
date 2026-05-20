import { Buffer } from 'node:buffer';
import { fetchTokeLiveMarket, TOKE_MINT, parseU64LE } from './tokeSnapshotShared.js';
import {
  maybeRecordHolderSnapshot,
  holderCountChange24h as globalHolderDelta24h,
  latestRecordedHolderCount
} from './holderSnapshotsKv.js';
import { maybeRecordMcapSnapshot, mcapPctChange24h } from './mcapSnapshotsKv.js';
import { buildStatsMeta, fetchSnapshotMetas } from './statsMeta.js';

const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL ?? 'https://api.mainnet-beta.solana.com';

const REQUEST_TIMEOUT_MS = 90000;

/** Server-side holder count cache — refreshed at most once every 5 minutes. */
const HOLDER_CACHE_TTL_MS = 5 * 60 * 1000;
let holderCache = { count: null, fetchedAt: 0, inFlight: false };

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
  maybeRecordHolderSnapshot(count).catch((err) => {
    console.error('[toke-stats] maybeRecordHolderSnapshot:', err?.message ?? err);
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

    let holderCountChange24h = null;
    if (Number.isFinite(resolvedHolders) && resolvedHolders >= 0) {
      holderCountChange24h = await globalHolderDelta24h(resolvedHolders);
      await maybeRecordHolderSnapshot(resolvedHolders);
    }

    const price = live.price;
    const supplyUi = live.totalSupplyUi;
    let mcapTrack = null;
    if (Number.isFinite(price) && price > 0 && Number.isFinite(supplyUi) && supplyUi > 0) {
      mcapTrack = price * supplyUi;
    } else if (Number.isFinite(live.marketCap) && live.marketCap > 0) {
      mcapTrack = live.marketCap;
    }

    let marketCapChangePct24h = null;
    if (mcapTrack != null && Number.isFinite(mcapTrack) && mcapTrack > 0) {
      marketCapChangePct24h = await mcapPctChange24h(mcapTrack);
      await maybeRecordMcapSnapshot(mcapTrack);
    }

    const { redisConfigured, holderMeta, mcapMeta } = await fetchSnapshotMetas(now);
    const statsMeta = buildStatsMeta({
      fetchedAtMs: holderCache.fetchedAt,
      ttlMs: HOLDER_CACHE_TTL_MS,
      redisConfigured,
      holderMeta,
      mcapMeta,
      holderCountChange24h,
      marketCapChangePct24h,
      now
    });

    return res.status(200).json({
      price: live.price,
      marketCap: live.marketCap,
      marketCapSource: live.marketCapSource,
      pairAddress: live.pairAddress,
      priceChangeH24: live.priceChangeH24,
      marketCapChangePct24h,
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
