/**
 * Server-side USD liquidity snapshots for ~24h % change (total DexScreener TOKE pool TVL).
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
  LIQUIDITY_SNAPSHOT_KEY
} from './statsMeta.js';

const SNAPSHOT_KEY = LIQUIDITY_SNAPSHOT_KEY;
const WRITE_LOCK_KEY = 'mctoken:toke:liquidity_snapshots:write_lock';

/** Meaningful move: ≥1% or ≥$25 (whichever is larger). */
function liquidityMeaningfullyChanged(lastL, l) {
  if (!Number.isFinite(lastL) || lastL <= 0) return true;
  const diff = Math.abs(l - lastL);
  return diff >= Math.max(25, lastL * 0.01);
}

function liquidityShouldAppend(last, stored, now) {
  const changed = last && liquidityMeaningfullyChanged(Number(last.m), stored);
  const periodic = shouldAppendPeriodic(last, now);
  return !last || changed || periodic;
}

/**
 * @param {number} liquidityUsd
 * @param {number} [now]
 * @param {{ record?: boolean }} [options]
 */
export async function resolveLiquiditySnapshotStats(
  liquidityUsd,
  now = Date.now(),
  { record = false } = {}
) {
  const l = Number(liquidityUsd);
  if (!Number.isFinite(l) || l <= 0) {
    return { changePct24h: null, meta: { ...EMPTY_SNAPSHOT_LIST_META } };
  }
  const stored = Math.round(l * 100) / 100;

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
        changePct24h = ((l - b) / b) * 100;
      }
    }

    if (record && liquidityShouldAppend(meta.newestRow, stored, now)) {
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
    console.error('[liquiditySnapshotsKv] resolveLiquiditySnapshotStats:', e?.message ?? e);
  }
  return { changePct24h: null, meta: { ...EMPTY_SNAPSHOT_LIST_META } };
}
