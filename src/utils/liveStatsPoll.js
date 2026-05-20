/**
 * Single in-flight poll for `/api/toke-stats` (fallback `/api/toke-price`).
 * Home + Navbar subscribe so we don't double-hit the API every 5s.
 */
import { fetchLiveStatsPayload } from './statsApi.js';

export const LIVE_STATS_POLL_MS = 15_000;

const listeners = new Set();
let intervalId = null;
let inFlight = false;
let lastSuccess = null;

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

function startPolling() {
  if (intervalId != null) return;
  void tick();
  intervalId = window.setInterval(tick, LIVE_STATS_POLL_MS);
}

function stopPollingIfIdle() {
  if (listeners.size > 0 || intervalId == null) return;
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
