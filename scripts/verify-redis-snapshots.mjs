#!/usr/bin/env node
/**
 * Ops check: Redis env + snapshot list lengths for holder/mcap 24h metrics.
 *
 * Usage:
 *   node scripts/verify-redis-snapshots.mjs
 *   # loads .env.development.local, .env.local, or .env if present
 *
 * Vercel production must expose the same URL/token pair (see api/redisClient.js).
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Redis } from '@upstash/redis';
import { parseSnapshotRow } from '../api/snapshotKvShared.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function loadEnvFile(name) {
  const path = resolve(ROOT, name);
  if (!existsSync(path)) return;
  const text = readFileSync(path, 'utf8');
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] == null) process.env[key] = val;
  }
}

for (const f of ['.env.development.local', '.env.local', '.env']) {
  loadEnvFile(f);
}

const url =
  process.env.UPSTASH_REDIS_REST_URL ||
  process.env.KV_REST_API_URL ||
  process.env.toke_KV_REST_API_URL;
const token =
  process.env.UPSTASH_REDIS_REST_TOKEN ||
  process.env.KV_REST_API_TOKEN ||
  process.env.toke_KV_REST_API_TOKEN;

if (!url || !token) {
  console.error(
    'Missing Redis REST credentials. Set UPSTASH_REDIS_REST_* or KV_REST_API_* or toke_KV_REST_API_* on Vercel Production, then redeploy.'
  );
  process.exit(1);
}

const redis = new Redis({ url, token });
const keys = [
  'mctoken:toke:holder_snapshots',
  'mctoken:toke:mcap_snapshots',
  'mctoken:toke:liquidity_snapshots',
  'mctoken:toke:avg_toke_snapshots'
];
const now = Date.now();
const cutoff = now - 24 * 60 * 60 * 1000;

for (const key of keys) {
  const len = await redis.llen(key);
  const head = len > 0 ? await redis.lrange(key, 0, 0) : [];
  const tail = len > 0 ? await redis.lrange(key, len - 1, len - 1) : [];
  const newest = parseSnapshotRow(head[0]);
  const oldest = parseSnapshotRow(tail[0]);
  const hasBaseline = oldest?.t != null && oldest.t <= cutoff;
  console.log(
    JSON.stringify({
      key,
      len,
      newest,
      oldest,
      hasBaseline24h: hasBaseline,
      hoursSinceOldest:
        oldest?.t != null ? Math.round((now - oldest.t) / 3600000) : null
    })
  );
}

console.log('\nIf len is 0 on production after deploy, check Vercel env vars and redeploy.');
