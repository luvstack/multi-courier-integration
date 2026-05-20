import { Router } from 'express';

import order from './orders';
import webhooks from './webhooks';

const router = Router();

router.use('/orders', order);
router.use('/webhooks', webhooks);

export default router;
