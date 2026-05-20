import { type Job, Worker } from 'bullmq';
import logger from 'jet-logger';

import {
  buildBullMQConnection,
  WEBHOOK_QUEUE_NAME,
  type WebhookJobData,
} from '@src/queues';
import { WebhookService } from '@src/services';

async function process(job: Job<WebhookJobData>): Promise<void> {
  const { courierPartner, payload } = job.data;
  logger.info(`Processing webhook job ${job.id} for ${courierPartner}`);
  await WebhookService.Webhooks.process(courierPartner, payload);
}

let worker: Worker<WebhookJobData> | null = null;

export function startWorker(): void {
  // Creating worker to process webhook jobs
  worker = new Worker<WebhookJobData>(WEBHOOK_QUEUE_NAME, process, {
    connection: buildBullMQConnection(),
    concurrency: 5,
  });

  worker.on('completed', (job) => {
    logger.info(`Webhook job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    logger.err(
      `Webhook job ${job?.id} failed (attempt ${job?.attemptsMade}): ${err.message}`,
    );
  });

  logger.info('Webhook worker started');
}

export async function stopWorker(): Promise<void> {
  if (worker) {
    await worker.close();
    worker = null;
    logger.info('Webhook worker stopped');
  }
}
