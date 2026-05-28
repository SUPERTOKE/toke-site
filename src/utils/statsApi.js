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

/** Comma thousands + 3 decimals (e.g. 32,277.043) — not locale-dependent. */
function commaThousands3(value) {
  const n = Math.round(Math.abs(value) * 1000) / 1000;
  const [intPart, dec] = n.toFixed(3).split('.');
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return value < 0 ? `-${grouped}.${dec}` : `${grouped}.${dec}`;
}

/** Token/supply amounts — comma thousands, period decimals, 3 dp (e.g. 32,290.238). */
export function formatTokenAmount3(value) {
  if (!Number.isFinite(value) || value <= 0) return '—';
  return commaThousands3(value);
}

/** Avg TOKE held (supply ÷ holders). */
export const formatAvgTokeDisplay = formatTokenAmount3;

/** Avg wallet USD (avg TOKE × price), 3 dp (e.g. $5.842). */
export function formatAvgWalletUsd(value) {
  if (!Number.isFinite(value) || value <= 0) return null;
  return `$${commaThousands3(value)}`;
}
