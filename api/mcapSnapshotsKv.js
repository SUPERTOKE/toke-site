/**
 * Server-side USD “mcap track” snapshots for ~24h % change (same Redis as holders).
 * Uses `price × circulating supply` when RPC supply exists, else Dex `marketCap`.
 */
import { getRedis } from './redisClient.js';
import {
  MS_DAY,
  findSnapshotAtOrBefore,
  appendSnapshotIfAllowed,
  shouldAppendPeriodic
} from './snapshotKvShared.js';
import {
  EMPTY_SNAPSHOT_LIST_META,
  getSnapshotListMeta,
  MCAP_SNAPSHOT_KEY
} from './statsMeta.js';

const SNAPSHOT_KEY = MCAP_SNAPSHOT_KEY;
const WRITE_LOCK_KEY = 'mctoken:toke:mcap_snapshots:write_lock';

/** Meaningful mcap move: ≥0.5% or ≥$50 (whichever is larger). */
function mcapMeaningfullyChanged(lastM, m) {
  if (!Number.isFinite(lastM) || lastM <= 0) return true;
  const diff = Math.abs(m - lastM);
  return diff >= Math.max(50, lastM * 0.005);
}

function mcapShouldAppend(last, stored, now) {
  const changed = last && mcapMeaningfullyChanged(Number(last.m), stored);
  const periodic = shouldAppendPeriodic(last, now);
  return !last || changed || periodic;
}

/**
 * One Redis pass: list meta + 24h % + optional append (prune only runs inside append).
 * @param {number} mcapUsd
 * @param {number} [now]
 * @param {{ record?: boolean }} [options]
 */
export async function resolveMcapSnapshotStats(mcapUsd, now = Date.now(), { record = false } = {}) {
  const m = Number(mcapUsd);
  if (!Number.isFinite(m) || m <= 0) {
    return { changePct24h: null, meta: { ...EMPTY_SNAPSHOT_LIST_META } };
  }
  const stored = Math.round(m * 100) / 100;

  try {
    const redis = getRedis();
    if (!redis) {
      return { changePct24h: null, meta: { ...EMPTY_SNAPSHOT_LIST_META } };
    }

    let meta = await getSnapshotListMeta(redis, SNAPSHOT_KEY, now);
    let changePct24h = null;

    const baseline = await findSnapshotAtOrBefore(redis, SNAPSHOT_KEY, now - MS_DAY);
    if (baseline && Number.isFinite(baseline.m)) {
      const b = Number(baseline.m);
      if (Number.isFinite(b) && b > 0) {
        changePct24h = ((m - b) / b) * 100;
      }
    }

    if (record && mcapShouldAppend(meta.newestRow, stored, now)) {
      const appended = await appendSnapshotIfAllowed(redis, {
        listKey: SNAPSHOT_KEY,
        lockKey: WRITE_LOCK_KEY,
        payloadJson: JSON.stringify({ t: now, m: stored }),
        now
      });
      if (appended) {
        meta = {
          ...meta,
          count: meta.count + 1,
          newestT: now,
          newestRow: { t: now, m: stored },
          oldestT: meta.oldestT ?? now,
          oldestRow: meta.oldestRow ?? { t: now, m: stored }
        };
      }
    }

    return { changePct24h, meta };
  } catch (e) {
    console.error('[mcapSnapshotsKv] resolveMcapSnapshotStats:', e?.message ?? e);
  }
  return { changePct24h: null, meta: { ...EMPTY_SNAPSHOT_LIST_META } };
}

/** @deprecated Prefer `resolveMcapSnapshotStats(..., { record: true })` */
export async function maybeRecordMcapSnapshot(mcapUsd, now = Date.now()) {
  await resolveMcapSnapshotStats(mcapUsd, now, { record: true });
}

/** @deprecated Prefer `resolveMcapSnapshotStats` */
export async function mcapPctChange24h(currentMcapUsd, now = Date.now()) {
  const { changePct24h } = await resolveMcapSnapshotStats(currentMcapUsd, now, {
    record: false
  });
  return changePct24h;
}
