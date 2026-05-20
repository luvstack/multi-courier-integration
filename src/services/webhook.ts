import logger from 'jet-logger';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import { CourierProvider } from '@src/libs';
import { OrderModel } from '@src/models/order';
import { TrackingHistoryModel } from '@src/models/tracking-history';
import { webhookQueue } from '@src/queues/webhook.queue';
import { ORDER_STATUSES, type OrderStatus, TRACKING_ACTIONS } from '@src/types';

export class Webhooks {
  /** Called by the controller — enqueues the job and responds immediately. */
  static async handle(
    courierPartner: CourierProvider.Types.CourierProvider,
    payload: Record<string, unknown>,
  ): Promise<{ success: true }> {
    try {
      logger.info({ courierPartner, payload, message: 'Webhook enqueued' });
      await webhookQueue.add('webhook', { courierPartner, payload });
      return { success: true };
    } catch (error) {
      throw new RouteError(
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        `Failed to enqueue webhook: ${(error as Error).message}`,
      );
    }
  }

  /** Called by the BullMQ worker — does the actual DB work. */
  static async process(
    courierPartner: CourierProvider.Types.CourierProvider,
    payload: Record<string, unknown>,
  ): Promise<void> {
    await Webhooks.applyTrackingUpdate(courierPartner, payload);
  }

  private static async applyTrackingUpdate(
    courierPartner: CourierProvider.Types.CourierProvider,
    payload: Record<string, unknown>,
  ): Promise<void> {
    try {
      const { trackingNumber, awbNumber, status } = payload;
      let tracking: string;

      switch (courierPartner) {
        case CourierProvider.Types.COURIER_PROVIDERS.urbanebolt: {
          tracking = trackingNumber as string;
          break;
        }
        case CourierProvider.Types.COURIER_PROVIDERS.mock: {
          tracking = awbNumber as string;
          break;
        }
        default: {
          logger.err({
            payload,
            message: `Unsupported courier partner: ${courierPartner}`,
          });
          return;
        }
      }

      if (!tracking) {
        logger.err({
          payload,
          message: 'Webhook payload is missing tracking number',
        });
        return;
      }

      // Find order by tracking number
      const order = await OrderModel.findOne({
        where: { awbNumber: tracking },
        attributes: ['id', 'orderId', 'status'],
        raw: true,
      });

      if (!order) {
        logger.err({
          payload,
          message: `No order found for tracking number "${tracking}"`,
        });
        return;
      }

      const newStatus = Webhooks.toOrderStatus(Webhooks.asString(status));

      // Update order status only if it has changed
      if (newStatus && newStatus !== order.status) {
        await OrderModel.update(
          { status: newStatus },
          { where: { id: order.id } },
        );
      }

      logger.info({
        orderId: order.id,
        newStatus,
        oldStatus: order.status,
        message: `Order status updated to "${newStatus}"`,
      });

      // Create tracking history for status update
      await TrackingHistoryModel.create({
        orderId: order.id,
        action: TRACKING_ACTIONS.STATUS_UPDATE,
        status: newStatus ?? order.status,
        responsePayload: payload,
      });
      logger.info({ orderId: order.id, message: `Tracking history created` });
      return;
    } catch (error) {
      if (error instanceof RouteError) {
        throw error;
      }
      throw new RouteError(
        HttpStatusCodes.BAD_REQUEST,
        `Webhook payload is invalid: ${(error as Error).message}`,
      );
    }
  }

  private static toOrderStatus(value?: string): OrderStatus | null {
    if (!value) return null;
    const upper = value.toUpperCase();
    return upper in ORDER_STATUSES ? (upper as OrderStatus) : null;
  }

  private static asString(value: unknown): string | undefined {
    if (value === null || value === undefined) return undefined;
    return String(value);
  }
}
