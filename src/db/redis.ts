import Redis, { type RedisOptions } from 'ioredis';
import logger from 'jet-logger';

import { env } from '../../config/env';

function buildOptions(): RedisOptions {
  return {
    lazyConnect: true,
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    ...(env.redis.tls ? { tls: {} } : {}),
  };
}

export const redis = env.redis.url
  ? new Redis(env.redis.url, buildOptions())
  : new Redis({
      ...buildOptions(),
      host: env.redis.host,
      port: env.redis.port,
      password: env.redis.password || undefined,
    });

redis.on('error', (err) => {
  logger.err(`Redis error: ${err.message}`);
});

export async function connectRedis(): Promise<void> {
  await redis.connect();
  logger.info('Redis connection established');
}

export async function disconnectRedis(): Promise<void> {
  await redis.quit();
  logger.info('Redis connection closed');
}
