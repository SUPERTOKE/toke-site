import { TOKE_MINT } from './tokeSnapshotShared.js';

const JUPITER_CONTENT_FEED = 'https://api.jup.ag/tokens/v2/content/feed';
const OEMBED_ENDPOINT = 'https://publish.twitter.com/oembed';
const REQUEST_TIMEOUT_MS = 12000;
const CACHE_TTL_MS = 12 * 60 * 1000;
const MAX_TWEETS = 20;
const OEMBED_CONCURRENCY = 4;

let cache = { tweets: null, fetchedAt: 0, inFlight: null };

function isTweetUrl(value) {
  return typeof value === 'string' && /^https?:\/\/(twitter\.com|x\.com)\//i.test(value);
}

function decodeHtmlEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function extractTweetText(html) {
  const match = html?.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  if (!match) return '';
  return decodeHtmlEntities(match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
}

function extractItems(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data?.contents)) return payload.data.contents;
  return payload?.data ?? payload?.content ?? payload?.items ?? [];
}

function normalizeTweet(item) {
  const rawContent = item?.content ?? '';
  const url = isTweetUrl(rawContent)
    ? rawContent
    : isTweetUrl(item?.source)
      ? item.source
      : null;

  const submittedBy = item?.submittedBy;
  const submitter =
    typeof submittedBy === 'string'
      ? submittedBy
      : submittedBy?.username ?? submittedBy?.name ?? null;

  return {
    id: item.contentId ?? item.id ?? null,
    text: url ? '' : String(rawContent),
    url,
    postedAt: item.postedAt ?? item.submittedAt ?? null,
    author: submitter
  };
}

function sortTweetsDesc(tweets) {
  return [...tweets].sort((a, b) => {
    const ta = a.postedAt ? Date.parse(a.postedAt) : 0;
    const tb = b.postedAt ? Date.parse(b.postedAt) : 0;
    return tb - ta;
  });
}

async function enrichTweetWithOembed(tweet, signal) {
  if (!tweet.url) return tweet;

  const oembedUrl = new URL(OEMBED_ENDPOINT);
  oembedUrl.searchParams.set('url', tweet.url);
  oembedUrl.searchParams.set('omit_script', '1');
  oembedUrl.searchParams.set('dnt', '1');

  const response = await fetch(oembedUrl.toString(), { signal });
  if (!response.ok) return tweet;

  const data = await response.json();
  const text = extractTweetText(data?.html);

  return {
    ...tweet,
    text: text || tweet.text || tweet.url,
    author: data?.author_name ?? tweet.author
  };
}

async function enrichTweets(tweets, signal) {
  const out = [];
  for (let i = 0; i < tweets.length; i += OEMBED_CONCURRENCY) {
    const batch = tweets.slice(i, i + OEMBED_CONCURRENCY);
    const settled = await Promise.allSettled(
      batch.map((tweet) => enrichTweetWithOembed(tweet, signal))
    );
    settled.forEach((result, idx) => {
      out.push(result.status === 'fulfilled' ? result.value : batch[idx]);
    });
  }
  return out;
}

async function fetchFromJupiter(signal) {
  const apiKey = process.env.JUPITER_API_KEY?.trim();
  const url = new URL(JUPITER_CONTENT_FEED);
  url.searchParams.set('mint', TOKE_MINT);
  url.searchParams.set('limit', '50');
  url.searchParams.set('page', '1');

  const headers = { Accept: 'application/json' };
  if (apiKey) headers['x-api-key'] = apiKey;

  const response = await fetch(url.toString(), { signal, headers });

  if (!response.ok) {
    throw new Error(`Jupiter content feed HTTP ${response.status}`);
  }

  const payload = await response.json();
  const items = extractItems(payload);

  const normalized = sortTweetsDesc(
    items
      .filter((item) => item?.contentType === 'tweet' && item?.content)
      .map(normalizeTweet)
      .filter((t) => t.id && (t.url || t.text))
      .slice(0, MAX_TWEETS)
  );

  return enrichTweets(normalized, signal);
}

async function getTweets(signal, forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cache.tweets && now - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.tweets;
  }

  if (cache.inFlight) {
    return cache.inFlight;
  }

  cache.inFlight = fetchFromJupiter(signal)
    .then((tweets) => {
      cache = { tweets, fetchedAt: Date.now(), inFlight: null };
      return tweets;
    })
    .catch((err) => {
      cache.inFlight = null;
      throw err;
    });

  return cache.inFlight;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=300');

  const forceRefresh =
    process.env.NODE_ENV !== 'production' && req.query?.refresh === '1';

  try {
    const tweets = await getTweets(controller.signal, forceRefresh);

    return res.status(200).json({
      mint: TOKE_MINT,
      tweets,
      count: tweets.length,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    const message =
      error?.name === 'AbortError'
        ? 'VRFD tweets request timed out'
        : 'Failed to fetch VRFD tweets';
    return res.status(502).json({ error: message });
  } finally {
    clearTimeout(timeout);
  }
}
