/**
 * Shared Redis snapshot helpers (batched reads, write debounce, hourly cadence).
 */
export const MS_HOUR = 60 * 60 * 1000;
export const MS_DAY = 24 * MS_HOUR;
/** Keep at most 48h of history (24h metric + buffer). */
export const MS_RETENTION = 48 * MS_HOUR;
/** Hard cap (~hourly cadence × 48h + headroom for value-change writes). */
export const MAX_SNAPSHOTS = 96;
export const SNAPSHOT_READ_BATCH = 32;
/** Collapse concurrent serverless writes (same value, same second). */
export const SNAPSHOT_WRITE_LOCK_SEC = 45;

/**
 * Normalize a list element from Upstash LRANGE (JSON string or pre-parsed object).
 */
export function parseSnapshotRow(raw) {
  if (raw == null || raw === '') return null;

  let row = raw;
  if (typeof raw === 'string') {
    try {
      row = JSON.parse(raw);
    } catch {
      return null;
    }
  }

  if (typeof row !== 'object' || row === null || Array.isArray(row)) return null;
  const t = Number(row.t);
  if (!Number.isFinite(t)) return null;
  return row;
}

/**
 * Newest-first list: return first entry with `t <= cutoff` (24h baseline).
 */
export async function findSnapshotAtOrBefore(redis, listKey, cutoff, maxScan = MAX_SNAPSHOTS) {
  for (let start = 0; start < maxScan; start += SNAPSHOT_READ_BATCH) {
    const end = Math.min(start + SNAPSHOT_READ_BATCH - 1, maxScan - 1);
    const rows = await redis.lrange(listKey, start, end);
    if (!rows?.length) return null;

    for (const row of rows) {
      const e = parseSnapshotRow(row);
      if (!e || !Number.isFinite(e.t)) continue;
      if (e.t <= cutoff) return e;
    }

    const oldestInBatch = parseSnapshotRow(rows[rows.length - 1]);
    if (oldestInBatch && Number.isFinite(oldestInBatch.t) && oldestInBatch.t > cutoff) {
      continue;
    }
    break;
  }
  return null;
}

export async function readNewestSnapshot(redis, listKey) {
  const head = await redis.lrange(listKey, 0, 0);
  return parseSnapshotRow(head[0]);
}

/**
 * SET NX lock then LPUSH + LTRIM — at most one writer per lock window across instances.
 */
/**
 * Drop tail entries older than {@link MS_RETENTION}. List is newest-first (LPUSH head).
 */
export async function pruneSnapshotsOlderThan(redis, listKey, now = Date.now()) {
  const cutoff = now - MS_RETENTION;
  const len = await redis.llen(listKey);
  if (!len) return;

  const BATCH = 64;
  for (let end = len - 1; end >= 0; end -= BATCH) {
    const start = Math.max(0, end - BATCH + 1);
    const rows = await redis.lrange(listKey, start, end);
    if (!rows?.length) return;

    for (let i = rows.length - 1; i >= 0; i--) {
      const idx = start + i;
      const e = parseSnapshotRow(rows[i]);
      if (e && Number.isFinite(e.t) && e.t >= cutoff) {
        if (idx < len - 1) {
          await redis.ltrim(listKey, 0, idx);
        }
        return;
      }
    }
  }

  // Do not wipe the list if the newest entry is still within retention (parse/scan edge cases).
  const head = await redis.lrange(listKey, 0, 0);
  const newest = parseSnapshotRow(head[0]);
  if (newest && Number.isFinite(newest.t) && newest.t >= cutoff) {
    return;
  }

  await redis.del(listKey);
}

export async function appendSnapshotIfAllowed(redis, { listKey, lockKey, payloadJson, now = Date.now() }) {
  const acquired = await redis.set(lockKey, '1', { nx: true, ex: SNAPSHOT_WRITE_LOCK_SEC });
  if (!acquired) return false;
  await redis.lpush(listKey, payloadJson);
  await redis.ltrim(listKey, 0, MAX_SNAPSHOTS - 1);
  await pruneSnapshotsOlderThan(redis, listKey, now);
  return true;
}

export function shouldAppendPeriodic(last, now) {
  if (!last || !Number.isFinite(last.t)) return true;
  return now - last.t >= MS_HOUR;
}
