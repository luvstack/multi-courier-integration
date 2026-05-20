import { Router } from 'express';

import { OrderController } from '@src/controllers';
import { validateBody, validateParams, validateQuery } from '@src/middlewares';
import {
  bulkOrderSchema,
  cancelOrderParamsSchema,
  createOrderSchema,
  trackOrderParamsSchema,
} from '@src/validators';

const router = Router();

router.post(
  '/',
  validateBody(createOrderSchema),
  OrderController.Order.createOrder,
);

router.post(
  '/bulk',
  validateBody(bulkOrderSchema),
  OrderController.Order.bulkOrder,
);

router.get(
  '/:orderId/track',
  validateParams(trackOrderParamsSchema),
  OrderController.Order.trackOrder,
);

router.post(
  '/:orderId/cancel',
  validateParams(cancelOrderParamsSchema),
  OrderController.Order.cancelOrder,
);

export default router;
