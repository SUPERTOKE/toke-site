/**
 * VRFD tweet feed from /api/vrfd-tweets (Jupiter Content API via Vercel proxy).
 * Vite dev proxies /api to production — use `vercel dev` to hit local API routes.
 */
export async function fetchVrfdTweets() {
  const res = await fetch('/api/vrfd-tweets', {
    method: 'GET',
    headers: { Accept: 'application/json' }
  });

  const text = await res.text();
  const trimmed = text.trim();

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const errBody = trimmed ? JSON.parse(trimmed) : null;
      if (errBody?.error) message = errBody.error;
    } catch {
      /* use status message */
    }
    throw new Error(message);
  }

  if (!trimmed || trimmed.startsWith('<') || trimmed.startsWith('<!')) {
    throw new Error(
      '/api/vrfd-tweets returned HTML, not JSON — check Vite proxy / vercel dev for /api'
    );
  }

  return JSON.parse(trimmed);
}
