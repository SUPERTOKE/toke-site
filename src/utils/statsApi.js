/**
 * Try live stats endpoints in order. Surfaces HTML/error-page responses instead of failing JSON.parse silently.
 */
export async function fetchLiveStatsPayload(paths = ['/api/toke-stats', '/api/toke-price']) {
  let lastErr = null;
  for (const path of paths) {
    try {
      const res = await fetch(path, {
        method: 'GET',
        headers: { Accept: 'application/json' }
      });
      const text = await res.text();
      const trimmed = text.trim();

      if (!res.ok) {
        lastErr = new Error(`${path} HTTP ${res.status}`);
        continue;
      }

      if (!trimmed || trimmed.startsWith('<') || trimmed.startsWith('<!')) {
        lastErr = new Error(
          `${path} returned HTML, not JSON — check Vite proxy / vercel dev for /api`
        );
        continue;
      }

      const data = JSON.parse(trimmed);

      return { data, path };
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error('Could not load live stats');
}

/** Coerce API number fields (including numeric strings). */
export function statNum(value) {
  if (value == null || value === '') return NaN;
  if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;
  const n = Number(String(value).replace(/,/g, ''));
  return Number.isFinite(n) ? n : NaN;
}
