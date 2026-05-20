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
  shouldAppendPeriodic
} from './snapshotKvShared.js';
import {
  EMPTY_SNAPSHOT_LIST_META,
  getSnapshotListMeta,
  HOLDER_SNAPSHOT_KEY
} from './statsMeta.js';

const SNAPSHOT_KEY = HOLDER_SNAPSHOT_KEY;
const WRITE_LOCK_KEY = 'mctoken:toke:holder_snapshots:write_lock';

function holderShouldAppend(last, count, now) {
  const c = Math.round(Number(count));
  const changed = last && Math.round(Number(last.c)) !== c;
  const periodic = shouldAppendPeriodic(last, now);
  return !last || changed || periodic;
}

/**
 * One Redis pass: list meta + 24h delta + optional append (prune only runs inside append).
 * @param {number} currentCount
 * @param {number} [now]
 * @param {{ record?: boolean }} [options]
 */
export async function resolveHolderSnapshotStats(
  currentCount,
  now = Date.now(),
  { record = false } = {}
) {
  const c = Math.round(Number(currentCount));
  try {
    const redis = getRedis();
    if (!redis) {
      return { change24h: null, meta: { ...EMPTY_SNAPSHOT_LIST_META } };
    }

    let meta = await getSnapshotListMeta(redis, SNAPSHOT_KEY, now);
    let change24h = null;

    if (Number.isFinite(c) && c >= 0) {
      const baseline = await findSnapshotAtOrBefore(redis, SNAPSHOT_KEY, now - MS_DAY);
      if (baseline && Number.isFinite(baseline.c)) {
        change24h = c - Math.round(Number(baseline.c));
      }

      if (record && holderShouldAppend(meta.newestRow, c, now)) {
        const appended = await appendSnapshotIfAllowed(redis, {
          listKey: SNAPSHOT_KEY,
          lockKey: WRITE_LOCK_KEY,
          payloadJson: JSON.stringify({ t: now, c }),
          now
        });
        if (appended) {
          meta = {
            ...meta,
            count: meta.count + 1,
            newestT: now,
            newestRow: { t: now, c },
            oldestT: meta.oldestT ?? now,
            oldestRow: meta.oldestRow ?? { t: now, c }
          };
        }
      }
    }

    return { change24h, meta };
  } catch (e) {
    console.error('[holderSnapshotsKv] resolveHolderSnapshotStats:', e?.message ?? e);
  }
  return { change24h: null, meta: { ...EMPTY_SNAPSHOT_LIST_META } };
}

/** @deprecated Prefer `resolveHolderSnapshotStats(..., { record: true })` */
export async function maybeRecordHolderSnapshot(count, now = Date.now()) {
  await resolveHolderSnapshotStats(count, now, { record: true });
}

/** Latest recorded count from Redis (display fallback while on-chain cache is cold). */
export async function latestRecordedHolderCount() {
  try {
    const redis = getRedis();
    if (!redis) return null;
    const last = await readNewestSnapshot(redis, SNAPSHOT_KEY);
    const n = last?.c;
    if (n == null || n === '') return null;
    const rounded = Math.round(Number(n));
    return Number.isFinite(rounded) && rounded >= 0 ? rounded : null;
  } catch (e) {
    console.error('[holderSnapshotsKv] latestRecordedHolderCount:', e?.message ?? e);
  }
  return null;
}

/** @deprecated Prefer `resolveHolderSnapshotStats` */
export async function holderCountChange24h(currentCount, now = Date.now()) {
  const { change24h } = await resolveHolderSnapshotStats(currentCount, now, {
    record: false
  });
  return change24h;
}
