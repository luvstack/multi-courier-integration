import Joi from 'joi';

import { CourierProvider } from '@src/libs';
import { type IGenericShipmentPayload, PAYMENT_MODES } from '@src/types';

export const bulkOrderItemSchema = Joi.object({
  customerId: Joi.string().trim().required(),
  orderId: Joi.string().trim().required(),
  paymentMode: Joi.string()
    .valid(...Object.values(PAYMENT_MODES))
    .required(),
  declaredValue: Joi.number().positive().required(),
  dimensions: Joi.object({
    length: Joi.number().positive().required(),
    breadth: Joi.number().positive().required(),
    height: Joi.number().positive().required(),
    weight: Joi.number().positive().required(),
  }).required(),
  customer: Joi.object({
    name: Joi.string().trim().required(),
    phone: Joi.string().trim().required(),
    email: Joi.string().email().optional(),
    address: Joi.string().trim().required(),
    city: Joi.string().trim().required(),
    state: Joi.string().trim().required(),
    country: Joi.string().trim().required(),
    pincode: Joi.string().trim().required(),
  }).required(),
  shipper: Joi.object({
    name: Joi.string().trim().required(),
    phone: Joi.string().trim().required(),
    email: Joi.string().email().optional(),
    address: Joi.string().trim().required(),
    city: Joi.string().trim().required(),
    state: Joi.string().trim().required(),
    country: Joi.string().trim().required(),
    pincode: Joi.string().trim().required(),
  }).required(),
  items: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        quantity: Joi.number().positive().required(),
        price: Joi.number().positive().required(),
      }),
    )
    .min(1)
    .required(),

  invoiceNumber: Joi.string().trim().required(),
  invoiceDate: Joi.string().required(),
  invoiceValue: Joi.number().positive().required(),
});

export const bulkOrderSchema = Joi.object({
  courierProvider: Joi.string()
    .valid(...Object.values(CourierProvider.Types.COURIER_PROVIDERS))
    .required(),
  orders: Joi.array().items(bulkOrderItemSchema).min(1).max(100).required(),
});

export const createOrderSchema = bulkOrderItemSchema.keys({
  courierProvider: Joi.string()
    .valid(...Object.values(CourierProvider.Types.COURIER_PROVIDERS))
    .required(),
});

export const trackOrderParamsSchema = Joi.object({
  orderId: Joi.string().trim().required(),
});

export const cancelOrderParamsSchema = Joi.object({
  orderId: Joi.string().trim().required(),
});
