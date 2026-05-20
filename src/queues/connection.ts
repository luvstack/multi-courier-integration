import IORedis from 'ioredis';

import { env } from '../../config/env';

/**
 * BullMQ requires maxRetriesPerRequest: null on its Redis connections.
 * It accepts either a RedisOptions object or an IORedis instance.
 * For URL-based connections we must create an IORedis instance because
 * RedisOptions has no "connectionString" field — passing a raw URL string
 * there is silently ignored and the worker falls back to localhost:6379.
 */
export function buildBullMQConnection(): IORedis {
  const base = {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    ...(env.redis.tls ? { tls: {} } : {}),
  };

  return env.redis.url
    ? new IORedis(env.redis.url, base)
    : new IORedis({
        ...base,
        host: env.redis.host,
        port: env.redis.port,
        password: env.redis.password || undefined,
      });
}
