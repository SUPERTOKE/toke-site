#!/usr/bin/env node
/**
 * Smoke-test /api/toke-stats shape (local vercel dev or production).
 *
 *   node scripts/check-stats-api.mjs
 *   STATS_API_ORIGIN=https://mctoken.xyz node scripts/check-stats-api.mjs
 */
const origin = (process.env.STATS_API_ORIGIN || 'https://mctoken.xyz').replace(/\/$/, '');
const url = `${origin}/api/toke-stats`;

const res = await fetch(url, { headers: { Accept: 'application/json' } });
const text = await res.text();
if (!res.ok) {
  console.error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
  process.exit(1);
}

const data = JSON.parse(text);
const meta = data.statsMeta ?? {};
const checks = {
  holderCount: data.holderCount != null,
  statsMeta: !!data.statsMeta,
  redisConfigured: meta.redisConfigured === true,
  holderSnapshotsCount: Number(meta.holderSnapshotsCount) > 0,
  mcapSnapshotsCount: Number(meta.mcapSnapshotsCount) > 0,
  liquidityUsd: data.liquidityUsd != null,
  liquiditySnapshotsCount: Number(meta.liquiditySnapshotsCount) > 0,
  holderChange24hSource: meta.holderChange24hSource,
  mcapChange24hSource: meta.mcapChange24hSource,
  liquidityChange24hSource: meta.liquidityChange24hSource,
  holderCountFetchedAt: !!data.holderCountFetchedAt,
  holderCountChange24h: data.holderCountChange24h,
  marketCapChangePct24h: data.marketCapChangePct24h,
  liquidityChangePct24h: data.liquidityChangePct24h
};

console.log(JSON.stringify({ url, checks }, null, 2));

if (meta.holderChange24hSource === 'redis' && meta.mcapChange24hSource === 'redis') {
  console.log('\nRedis 24h metrics are live.');
  process.exit(0);
}

if (!meta.redisConfigured) {
  console.error('\nRedis is not configured on this deployment. Add env vars on Vercel and redeploy.');
  process.exit(2);
}

if (meta.holderChange24hSource === 'unavailable_warming') {
  console.log('\nRedis is configured; waiting for ~24h of snapshot history before deltas appear.');
  process.exit(0);
}

process.exit(0);
