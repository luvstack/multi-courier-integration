import { Router } from 'express';

import { WebhookController } from '@src/controllers';
import { validateBody, validateParams } from '@src/middlewares';
import { webhookBodySchema, webhookParamsSchema } from '@src/validators';

const router = Router();

router.post(
  '/:courierPartner',
  validateParams(webhookParamsSchema),
  validateBody(webhookBodySchema),
  WebhookController.Webhook.handle,
);

export default router;
