/**
 * Diagnostics for Redis-backed 24h stats (holder / mcap snapshots).
 */
import { getRedis } from './redisClient.js';
import { MS_DAY, parseSnapshotRow } from './snapshotKvShared.js';

export const HOLDER_SNAPSHOT_KEY = 'mctoken:toke:holder_snapshots';
export const MCAP_SNAPSHOT_KEY = 'mctoken:toke:mcap_snapshots';

export const EMPTY_SNAPSHOT_LIST_META = {
  count: 0,
  oldestT: null,
  newestT: null,
  hasBaseline24h: false,
  newestRow: null,
  oldestRow: null
};

/**
 * @param {import('@upstash/redis').Redis | null} redis
 * @param {string} listKey
 * @param {number} [now]
 */
export async function getSnapshotListMeta(redis, listKey, now = Date.now()) {
  if (!redis) {
    return { ...EMPTY_SNAPSHOT_LIST_META };
  }

  try {
    const count = await redis.llen(listKey);
    if (!count) {
      return { ...EMPTY_SNAPSHOT_LIST_META };
    }

    const [head, tail] = await Promise.all([
      redis.lrange(listKey, 0, 0),
      redis.lrange(listKey, count - 1, count - 1)
    ]);
    const newestRow = parseSnapshotRow(head[0]);
    const oldestRow = parseSnapshotRow(tail[0]);
    const newestT = newestRow?.t ?? null;
    const oldestT = oldestRow?.t ?? null;
    const cutoff = now - MS_DAY;
    const hasBaseline24h =
      Number.isFinite(oldestT) && oldestT <= cutoff;

    return { count, oldestT, newestT, hasBaseline24h, newestRow, oldestRow };
  } catch (e) {
    console.error('[statsMeta] getSnapshotListMeta:', e?.message ?? e);
    return { ...EMPTY_SNAPSHOT_LIST_META };
  }
}

/**
 * @param {boolean} redisConfigured
 * @param {{ count: number, hasBaseline24h: boolean }} listMeta
 * @param {number | null} changeValue
 */
export function change24hSource(redisConfigured, listMeta, changeValue) {
  if (changeValue != null && Number.isFinite(changeValue)) return 'redis';
  if (!redisConfigured) return 'unavailable_no_redis';
  if (listMeta.count === 0 || !listMeta.hasBaseline24h) return 'unavailable_warming';
  return 'unavailable_warming';
}

/**
 * @param {number} fetchedAtMs
 * @param {number} ttlMs
 * @param {number} [now]
 */
export function holderCountStale(fetchedAtMs, ttlMs, now = Date.now()) {
  if (!fetchedAtMs || fetchedAtMs <= 0) return true;
  return now - fetchedAtMs >= ttlMs;
}

export function buildStatsMeta({
  fetchedAtMs,
  ttlMs,
  redisConfigured,
  holderMeta,
  mcapMeta,
  holderCountChange24h,
  marketCapChangePct24h,
  now = Date.now()
}) {
  const holderChange24hSource = change24hSource(
    redisConfigured,
    holderMeta,
    holderCountChange24h
  );
  const mcapChange24hSource = change24hSource(
    redisConfigured,
    mcapMeta,
    marketCapChangePct24h
  );

  return {
    redisConfigured,
    holderCountFetchedAt:
      fetchedAtMs > 0 ? new Date(fetchedAtMs).toISOString() : null,
    holderCountStale: holderCountStale(fetchedAtMs, ttlMs, now),
    holderSnapshotsCount: holderMeta.count,
    mcapSnapshotsCount: mcapMeta.count,
    holderOldestSnapshotAt:
      holderMeta.oldestT != null ? new Date(holderMeta.oldestT).toISOString() : null,
    mcapOldestSnapshotAt:
      mcapMeta.oldestT != null ? new Date(mcapMeta.oldestT).toISOString() : null,
    holderChange24hSource,
    mcapChange24hSource
  };
}

export async function fetchSnapshotMetas(now = Date.now()) {
  const redis = getRedis();
  const [holderMeta, mcapMeta] = await Promise.all([
    getSnapshotListMeta(redis, HOLDER_SNAPSHOT_KEY, now),
    getSnapshotListMeta(redis, MCAP_SNAPSHOT_KEY, now)
  ]);
  return { redis, redisConfigured: !!redis, holderMeta, mcapMeta };
}
