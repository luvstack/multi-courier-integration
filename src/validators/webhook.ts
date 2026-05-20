import Joi from 'joi';

import { CourierProvider } from '@src/libs';

export const webhookParamsSchema = Joi.object({
  courierPartner: Joi.string()
    .valid(...Object.values(CourierProvider.Types.COURIER_PROVIDERS))
    .required(),
});

// Bodies vary by partner; keep loose and let the service normalize.
export const webhookBodySchema = Joi.object().unknown(true).required();
