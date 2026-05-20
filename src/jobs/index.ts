import * as WebhookJob from './webhook.job';

export function startAllWorkers(): void {
  WebhookJob.startWorker();
}

export async function stopAllWorkers(): Promise<void> {
  await WebhookJob.stopWorker();
}
