/**
 * Single Upstash Redis client for Vercel serverless (`holderSnapshotsKv`, `mcapSnapshotsKv`, …).
 * @see holderSnapshotsKv.js for env var names.
 */
import { Redis } from '@upstash/redis';

function redisFromEnv() {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.KV_REST_API_URL ||
    process.env.toke_KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.KV_REST_API_TOKEN ||
    process.env.toke_KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

let redisSingleton = undefined;

export function getRedis() {
  if (redisSingleton === undefined) {
    redisSingleton = redisFromEnv();
  }
  return redisSingleton;
}
