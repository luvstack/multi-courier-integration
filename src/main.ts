import http from 'http';
import logger from 'jet-logger';

import EnvVars from './common/constants/env';
import { connectDb, connectRedis, disconnectDb, disconnectRedis } from './db';
import { startAllWorkers, stopAllWorkers } from './jobs';
import server from './server';

const SERVER_START_MESSAGE =
  'Express server started on port: ' + EnvVars.Port.toString();

async function shutdown(
  httpServer: http.Server,
  signal: string,
): Promise<void> {
  logger.info(`${signal} received, shutting down gracefully`);

  // 1. Stop accepting new HTTP connections.
  await new Promise<void>((resolve) => httpServer.close(() => resolve()));
  logger.info('HTTP server closed');

  // 2. Drain in-flight BullMQ jobs.
  await stopAllWorkers();

  // 3. Close DB and Redis.
  await disconnectDb();
  await disconnectRedis();

  logger.info('Shutdown complete');
  process.exit(0);
}

async function bootstrap(): Promise<void> {
  try {
    await connectDb();
    await connectRedis();
    startAllWorkers();
  } catch (err) {
    logger.err('Failed to initialize infrastructure');
    logger.err(err as Error);
    process.exit(1);
  }

  const httpServer = server.listen(EnvVars.Port, () => {
    logger.info(SERVER_START_MESSAGE);
  });

  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.once(signal, () => void shutdown(httpServer, signal));
  }
}

void bootstrap();
