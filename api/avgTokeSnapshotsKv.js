/**
 * Server-side avg-wallet USD snapshots (supply ÷ holders × price) for ~24h change metadata.
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
  AVG_TOKE_SNAPSHOT_KEY
} from './statsMeta.js';

const SNAPSHOT_KEY = AVG_TOKE_SNAPSHOT_KEY;
const WRITE_LOCK_KEY = 'mctoken:toke:avg_toke_snapshots:write_lock';

/** Meaningful move: ≥$0.01 or ≥0.5% vs last snapshot. */
function avgWalletUsdMeaningfullyChanged(lastM, m) {
  if (!Number.isFinite(lastM) || lastM <= 0) return true;
  const diff = Math.abs(m - lastM);
  return diff >= Math.max(0.01, lastM * 0.005);
}

function avgTokeShouldAppend(last, stored, now) {
  const changed = last && avgWalletUsdMeaningfullyChanged(Number(last.m), stored);
  const periodic = shouldAppendPeriodic(last, now);
  return !last || changed || periodic;
}

/**
 * @param {number} avgWalletUsd — (supply ÷ holders) × price USD
 * @param {number} [now]
 * @param {{ record?: boolean }} [options]
 */
export async function resolveAvgTokeSnapshotStats(avgWalletUsd, now = Date.now(), { record = false } = {}) {
  const m = Number(avgWalletUsd);
  if (!Number.isFinite(m) || m <= 0) {
    return { change24h: null, meta: { ...EMPTY_SNAPSHOT_LIST_META } };
  }
  const stored = Math.round(m * 1000) / 1000;

  try {
    const redis = getRedis();
    if (!redis) {
      return { change24h: null, meta: { ...EMPTY_SNAPSHOT_LIST_META } };
    }

    let meta = await getSnapshotListMeta(redis, SNAPSHOT_KEY, now);
    let change24h = null;

    const baseline = await findSnapshotAtOrBefore(redis, SNAPSHOT_KEY, now - MS_DAY);
    if (baseline && Number.isFinite(baseline.m)) {
      const b = Number(baseline.m);
      if (Number.isFinite(b) && b > 0) {
        change24h = Math.round((m - b) * 1000) / 1000;
      }
    }

    if (record && avgTokeShouldAppend(meta.newestRow, stored, now)) {
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

    return { change24h, meta };
  } catch (e) {
    console.error('[avgTokeSnapshotsKv] resolveAvgTokeSnapshotStats:', e?.message ?? e);
  }
  return { change24h: null, meta: { ...EMPTY_SNAPSHOT_LIST_META } };
}
