/**
 * Single in-flight poll for `/api/toke-stats` (fallback `/api/toke-price`).
 * Home + Navbar subscribe so we don't double-hit the API.
 */
import { fetchLiveStatsPayload } from './statsApi.js';

const DEFAULT_POLL_MS = 30_000;
const HIDDEN_POLL_MS = 60_000;

function parsePollMs(raw, fallback) {
  const n = Number(raw);
  return Number.isFinite(n) && n >= 10_000 ? n : fallback;
}

/** Client poll interval (override via `VITE_LIVE_STATS_POLL_MS`). */
export const LIVE_STATS_POLL_MS = parsePollMs(
  import.meta.env.VITE_LIVE_STATS_POLL_MS,
  DEFAULT_POLL_MS
);

const listeners = new Set();
let intervalId = null;
let inFlight = false;
let lastSuccess = null;

function currentPollMs() {
  if (typeof document !== 'undefined' && document.hidden) {
    return Math.max(LIVE_STATS_POLL_MS, HIDDEN_POLL_MS);
  }
  return LIVE_STATS_POLL_MS;
}

function rescheduleInterval() {
  if (intervalId == null) return;
  window.clearInterval(intervalId);
  intervalId = window.setInterval(tick, currentPollMs());
}

async function tick() {
  if (inFlight) return;
  inFlight = true;
  try {
    const result = await fetchLiveStatsPayload(['/api/toke-stats', '/api/toke-price']);
    lastSuccess = result;
    for (const fn of listeners) {
      fn({ ...result, error: null });
    }
  } catch (error) {
    for (const fn of listeners) {
      fn({ data: lastSuccess?.data ?? null, path: lastSuccess?.path ?? null, error });
    }
  } finally {
    inFlight = false;
  }
}

function onVisibilityChange() {
  rescheduleInterval();
  if (!document.hidden) {
    void tick();
  }
}

function startPolling() {
  if (intervalId != null) return;
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', onVisibilityChange);
  }
  void tick();
  intervalId = window.setInterval(tick, currentPollMs());
}

function stopPollingIfIdle() {
  if (listeners.size > 0 || intervalId == null) return;
  if (typeof document !== 'undefined') {
    document.removeEventListener('visibilitychange', onVisibilityChange);
  }
  window.clearInterval(intervalId);
  intervalId = null;
}

/**
 * @param {(payload: { data: object|null, path: string|null, error: Error|null }) => void} listener
 * @returns {() => void} unsubscribe
 */
export function subscribeLiveStats(listener) {
  listeners.add(listener);
  startPolling();
  if (lastSuccess) {
    listener({ ...lastSuccess, error: null });
  } else {
    void tick();
  }
  return () => {
    listeners.delete(listener);
    stopPollingIfIdle();
  };
}
