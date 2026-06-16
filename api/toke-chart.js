/**
 * 24h $TOKE USD price series from GeckoTerminal OHLCV (Meteora pool).
 * Cached ~60s to respect GeckoTerminal free-tier rate limits.
 */
import { fetchGeckoTokeOhlcv, peekGeckoTokeOhlcvCache } from './geckoTokeOhlcv.js';

const REQUEST_TIMEOUT_MS = 12_000;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const payload = await fetchGeckoTokeOhlcv(controller.signal);
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    return res.status(200).json(payload);
  } catch (error) {
    const message =
      error?.name === 'AbortError' ? 'Chart request timed out' : 'Failed to fetch chart data';
    console.error('[toke-chart]', error?.message ?? error);

    const stale = peekGeckoTokeOhlcvCache();
    if (stale) {
      res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');
      return res.status(200).json({
        ...stale,
        stale: true,
        updatedAt: stale.updatedAt
      });
    }

    return res.status(502).json({ error: message });
  } finally {
    clearTimeout(timeout);
  }
}
