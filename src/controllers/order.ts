import { NextFunction, Request, Response } from 'express';

import { OrderService } from '@src/services';

export class Order {
  static async createOrder(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await OrderService.Orders.createOrder(req.body);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async trackOrder(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { orderId } = req.params;

      const result = await OrderService.Orders.trackOrder(orderId as string);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async cancelOrder(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { orderId } = req.params as { orderId: string };

      const result = await OrderService.Orders.cancelOrder(orderId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async bulkOrder(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await OrderService.Orders.bulkOrder(req.body);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
