import { NextFunction, Request, Response } from 'express';

import type { CourierProvider as CourierProviderName } from '@src/libs/providers/types';
import { WebhookService } from '@src/services';

export class Webhook {
  static async handle(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { courierPartner } = req.params as {
        courierPartner: CourierProviderName;
      };

      const result = await WebhookService.Webhooks.handle(
        courierPartner,
        req.body as Record<string, unknown>,
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
