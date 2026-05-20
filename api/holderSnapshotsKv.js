/**
 * Shared holder-count history on Upstash Redis (Vercel “Storage” / Redis integration).
 * Env (either naming works after `vercel link` + Storage or `vercel env pull`):
 *   `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`, or legacy `KV_REST_API_*`,
 *   or `vercel env pull` names like `toke_KV_REST_API_URL` + `toke_KV_REST_API_TOKEN` (storage id prefix).
 * If unset, helpers no-op and the API returns `holderCountChange24h: null`.
 */
import { getRedis } from './redisClient.js';
import {
  MS_DAY,
  findSnapshotAtOrBefore,
  readNewestSnapshot,
  appendSnapshotIfAllowed,
  pruneSnapshotsOlderThan,
  shouldAppendPeriodic
} from './snapshotKvShared.js';

const SNAPSHOT_KEY = 'mctoken:toke:holder_snapshots';
const WRITE_LOCK_KEY = 'mctoken:toke:holder_snapshots:write_lock';

/**
 * Append `{ t, c }` when count changes or at most hourly — keeps list small; safe to call every GET.
 */
export async function maybeRecordHolderSnapshot(count, now = Date.now()) {
  const c = Math.round(Number(count));
  if (!Number.isFinite(c) || c < 0) return;
  try {
    const redis = getRedis();
    if (!redis) return;
    const last = await readNewestSnapshot(redis, SNAPSHOT_KEY);
    const changed = last && Math.round(Number(last.c)) !== c;
    const periodic = shouldAppendPeriodic(last, now);
    if (!last || changed || periodic) {
      await appendSnapshotIfAllowed(redis, {
        listKey: SNAPSHOT_KEY,
        lockKey: WRITE_LOCK_KEY,
        payloadJson: JSON.stringify({ t: now, c }),
        now
      });
    }
    await pruneSnapshotsOlderThan(redis, SNAPSHOT_KEY, now);
  } catch (e) {
    console.error('[holderSnapshotsKv] maybeRecordHolderSnapshot:', e?.message ?? e);
  }
}

/** Latest recorded count from Redis (display fallback while on-chain cache is cold). */
export async function latestRecordedHolderCount() {
  try {
    const redis = getRedis();
    if (!redis) return null;
    const last = await readNewestSnapshot(redis, SNAPSHOT_KEY);
    const c = last?.c;
    if (c == null || c === '') return null;
    const n = Math.round(Number(c));
    return Number.isFinite(n) && n >= 0 ? n : null;
  } catch (e) {
    console.error('[holderSnapshotsKv] latestRecordedHolderCount:', e?.message ?? e);
  }
  return null;
}

/** `current − baseline` where baseline is the newest snapshot with `t <= now − 24h` (list is newest-first). */
export async function holderCountChange24h(currentCount, now = Date.now()) {
  const c = Math.round(Number(currentCount));
  if (!Number.isFinite(c) || c < 0) return null;
  try {
    const redis = getRedis();
    if (!redis) return null;
    const cutoff = now - MS_DAY;
    const baseline = await findSnapshotAtOrBefore(redis, SNAPSHOT_KEY, cutoff);
    if (!baseline || !Number.isFinite(baseline.c)) return null;
    return c - Math.round(Number(baseline.c));
  } catch (e) {
    console.error('[holderSnapshotsKv] holderCountChange24h:', e?.message ?? e);
  }
  return null;
}
