import { fetchTokeLiveMarket } from '../lib/tokeSnapshotShared.js';
import { fetchOracle } from '../lib/oracleClient.js';

const REQUEST_TIMEOUT_MS = 8000;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    // Canonical /v1/oracle first (one price implementation platform-wide);
    // legacy DexScreener path only when the oracle is unreachable.
    const oracle = await fetchOracle(controller.signal, 6000);
    const live = oracle
      ? {
          price: oracle.price,
          marketCap: oracle.marketCap,
          marketCapSource: oracle.marketCap != null ? 'oracle' : null,
          pairAddress: oracle.pairAddress,
          priceChangeH24: oracle.priceChangeH24,
          priceChangeH24Source: oracle.priceChangeH24 != null ? 'oracle' : null
        }
      : await fetchTokeLiveMarket(controller.signal);

    res.setHeader('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=30');
    return res.status(200).json({
      price: live.price,
      marketCap: live.marketCap,
      marketCapSource: live.marketCapSource,
      pairAddress: live.pairAddress,
      priceChangeH24: live.priceChangeH24,
      priceChangeH24Source: live.priceChangeH24Source,
      statsSource: oracle ? 'oracle' : 'fallback',
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    const message =
      error?.name === 'AbortError' ? 'Price request timed out' : 'Failed to fetch live price';
    return res.status(502).json({ error: message });
  } finally {
    clearTimeout(timeout);
  }
}
