import { Queue } from 'bullmq';

import type { CourierProvider } from '@src/libs/providers/types';

import { buildBullMQConnection } from './connection';

export interface WebhookJobData {
  courierPartner: CourierProvider;
  payload: Record<string, unknown>;
}

export const WEBHOOK_QUEUE_NAME = 'webhooks';

export const webhookQueue = new Queue<WebhookJobData>(WEBHOOK_QUEUE_NAME, {
  connection: buildBullMQConnection(),
  defaultJobOptions: {
    attempts: 3, // 3 attempts to process the job
    backoff: { type: 'exponential', delay: 2000 }, // 2 seconds delay between attempts
    removeOnComplete: { count: 500 }, // remove the job after it is completed
    removeOnFail: { count: 1000 }, // keep recent 1000 failed jobs
  },
});
