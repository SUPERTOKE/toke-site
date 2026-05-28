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

/** USD market cap with thousands separators, whole dollars only (Dex mcap is integer-scale). */
export function formatMarketCapDisplay(value) {
  if (!Number.isFinite(value) || value <= 0) return '—';
  const rounded = Math.round(value);
  return `$${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(rounded)}`;
}

/** USD liquidity / TVL — same formatting as market cap. */
export const formatLiquidityDisplay = formatMarketCapDisplay;

/** Avg TOKE held (supply ÷ holders), always 3 fractional digits. */
export function formatAvgTokeDisplay(value) {
  if (!Number.isFinite(value) || value <= 0) return '—';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3
  }).format(value);
}

/** 24h absolute change in avg TOKE (signed, always 3 fractional digits). */
export function formatAvgTokeDelta(delta) {
  if (!Number.isFinite(delta)) return null;
  const rounded = Math.round(delta * 1000) / 1000;
  if (rounded === 0) return '+0.000';
  const abs = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3
  }).format(Math.abs(rounded));
  return rounded > 0 ? `+${abs}` : `-${abs}`;
}
