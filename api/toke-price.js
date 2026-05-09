import { fetchTokeLiveMarket } from './tokeSnapshotShared.js';

const REQUEST_TIMEOUT_MS = 8000;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const live = await fetchTokeLiveMarket(controller.signal);

    return res.status(200).json({
      price: live.price,
      marketCap: live.marketCap,
      marketCapSource: live.marketCapSource,
      pairAddress: live.pairAddress,
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
