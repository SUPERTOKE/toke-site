/**
 * Shared poll for `/api/toke-chart` — one request serves every sparkline on the page.
 */
const POLL_MS = 60_000;

const listeners = new Set();
let intervalId = null;
let inFlight = false;
let lastSuccess = null;

async function tick() {
  if (inFlight) return;
  inFlight = true;
  try {
    const res = await fetch('/api/toke-chart', {
      method: 'GET',
      headers: { Accept: 'application/json' }
    });
    const text = await res.text();
    const trimmed = text.trim();
    if (!res.ok || !trimmed || trimmed.startsWith('<')) {
      throw new Error(res.ok ? 'Invalid chart response' : `Chart HTTP ${res.status}`);
    }
    const data = JSON.parse(trimmed);
    if (!Array.isArray(data?.points) || data.points.length === 0) {
      throw new Error('No chart points');
    }
    lastSuccess = { data, error: null };
    for (const fn of listeners) fn(lastSuccess);
  } catch (error) {
    for (const fn of listeners) fn({ data: lastSuccess?.data ?? null, error });
  } finally {
    inFlight = false;
  }
}

function startPolling() {
  if (intervalId != null) return;
  void tick();
  intervalId = window.setInterval(tick, POLL_MS);
}

function stopPollingIfIdle() {
  if (listeners.size > 0 || intervalId == null) return;
  window.clearInterval(intervalId);
  intervalId = null;
}

/** @param {(payload: { data: object|null, error: Error|null }) => void} listener */
export function subscribeTokeChart(listener) {
  listeners.add(listener);
  startPolling();
  if (lastSuccess) listener(lastSuccess);
  else void tick();
  return () => {
    listeners.delete(listener);
    stopPollingIfIdle();
  };
}
