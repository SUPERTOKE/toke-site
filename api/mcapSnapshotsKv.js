/**
 * Server-side USD “mcap track” snapshots for ~24h % change (same Redis as holders).
 * Uses `price × circulating supply` when RPC supply exists, else Dex `marketCap`.
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

const SNAPSHOT_KEY = 'mctoken:toke:mcap_snapshots';
const WRITE_LOCK_KEY = 'mctoken:toke:mcap_snapshots:write_lock';

/** Meaningful mcap move: ≥0.5% or ≥$50 (whichever is larger). */
function mcapMeaningfullyChanged(lastM, m) {
  if (!Number.isFinite(lastM) || lastM <= 0) return true;
  const diff = Math.abs(m - lastM);
  return diff >= Math.max(50, lastM * 0.005);
}

/**
 * Append `{ t, m }` when value moves meaningfully or at most hourly.
 */
export async function maybeRecordMcapSnapshot(mcapUsd, now = Date.now()) {
  const m = Number(mcapUsd);
  if (!Number.isFinite(m) || m <= 0) return;
  const stored = Math.round(m * 100) / 100;
  try {
    const redis = getRedis();
    if (!redis) return;
    const last = await readNewestSnapshot(redis, SNAPSHOT_KEY);
    const changed = last && mcapMeaningfullyChanged(Number(last.m), stored);
    const periodic = shouldAppendPeriodic(last, now);
    if (!last || changed || periodic) {
      await appendSnapshotIfAllowed(redis, {
        listKey: SNAPSHOT_KEY,
        lockKey: WRITE_LOCK_KEY,
        payloadJson: JSON.stringify({ t: now, m: stored }),
        now
      });
    }
    await pruneSnapshotsOlderThan(redis, SNAPSHOT_KEY, now);
  } catch (e) {
    console.error('[mcapSnapshotsKv] maybeRecordMcapSnapshot:', e?.message ?? e);
  }
}

/** % change vs newest snapshot with `t <= now − 24h` (list is newest-first). */
export async function mcapPctChange24h(currentMcapUsd, now = Date.now()) {
  const m = Number(currentMcapUsd);
  if (!Number.isFinite(m) || m <= 0) return null;
  try {
    const redis = getRedis();
    if (!redis) return null;
    const cutoff = now - MS_DAY;
    const baseline = await findSnapshotAtOrBefore(redis, SNAPSHOT_KEY, cutoff);
    if (!baseline || !Number.isFinite(baseline.m)) return null;
    const b = Number(baseline.m);
    if (!Number.isFinite(b) || b <= 0) return null;
    return ((m - b) / b) * 100;
  } catch (e) {
    console.error('[mcapSnapshotsKv] mcapPctChange24h:', e?.message ?? e);
  }
  return null;
}
