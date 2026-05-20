import { InferCreationAttributes } from 'sequelize';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import { CourierProvider } from '@src/libs';
import { type CourierProvider as CourierProviderName } from '@src/libs/providers/types';
import { OrderModel } from '@src/models/order';
import { TrackingHistoryModel } from '@src/models/tracking-history';
import logger from 'jet-logger';
import {
  type IBulkOrderPayload,
  ICancelOrderResponse,
  type IGenericShipmentOrderItem,
  type IGenericShipmentPayload,
  IOrderResponse,
  ITrackOrderResponse,
  ORDER_STATUSES,
  TRACKING_ACTIONS,
} from '@src/types';

export class Orders {
  static async createOrder(
    payload: IGenericShipmentPayload,
  ): Promise<IOrderResponse> {
    try {
      const { courierProvider, orderId, customerId } = payload;

      const isOrderExists = await OrderModel.findOne({
        where: { orderId: payload.orderId },
        attributes: ['id', 'orderId'],
        raw: true,
      });
      if (isOrderExists) {
        throw new RouteError(
          HttpStatusCodes.BAD_REQUEST,
          `Order with id "${payload.orderId}" already exists`,
        );
      }
      const [mappedRequest] = CourierProvider.Mappers.ShipmentMapper.mapOrders(
        courierProvider,
        [payload],
      );

      const client =
        await CourierProvider.CourierFactory.Factory.getProvider(
          courierProvider,
        );

      const response = await client.createOrder([
        mappedRequest,
      ] as unknown as CourierProvider.Urbanebolt.Types.IShipmentPayload[] &
        CourierProvider.Mock.Types.IMockShipmentPayload[]);

      const dbOrder = await OrderModel.create({
        orderId,
        customerId,
        courierProvider,
        courierOrderId: null,
        awbNumber: response.successResponse[0].awbNumber.toString(),
        status: ORDER_STATUSES.CREATED,
      });

      logger.info({ message: 'Order created', orderId: dbOrder.id });

      // Create tracking history
      TrackingHistoryModel.create({
        orderId: dbOrder.id,
        action: TRACKING_ACTIONS.CREATE,
        requestPayload: mappedRequest as unknown as Record<string, unknown>,
        responsePayload: response as unknown as Record<string, unknown>,
        status: ORDER_STATUSES.CREATED,
      });

      const { successOrders, failedOrders } =
        CourierProvider.Mappers.ShipmentMapper.mapCreateOrderResponse(
          courierProvider,
          response,
        );

      const finalOrder = [{ ...successOrders[0], orderId: dbOrder.id }];
      return {
        successOrders: finalOrder,
        failedOrders,
      };
    } catch (error) {
      if (error instanceof RouteError) {
        throw error;
      }
      throw new RouteError(
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        `Failed to create order: ${(error as Error).message}`,
      );
    }
  }

  static async bulkOrder(payload: IBulkOrderPayload): Promise<IOrderResponse> {
    try {
      const { courierProvider, orders } = payload;

      const isOrdersExists = await OrderModel.findAll({
        where: { orderId: orders.map((order) => order.orderId) },
        attributes: ['id', 'orderId'],
        raw: true,
      });

      const finalOrders = orders.filter(
        (order) => !isOrdersExists.some((o) => o.orderId === order.orderId),
      );
      const failedOrders = isOrdersExists.map((order) => {
        return {
          orderNumber: order.orderId,
          message: `Order with id "${order.orderId}" already exists`,
        };
      });

      if (!finalOrders.length) {
        return {
          failedOrders,
          successOrders: [],
        };
      }

      const mappedRequests = CourierProvider.Mappers.ShipmentMapper.mapOrders(
        courierProvider,
        orders,
      );
      const client =
        await CourierProvider.CourierFactory.Factory.getProvider(
          courierProvider,
        );
      // const orderIds = orders.map((o) => o.orderId);

      const response = await client.createOrder(
        mappedRequests as unknown as CourierProvider.Urbanebolt.Types.IShipmentPayload[] &
          CourierProvider.Mock.Types.IMockShipmentPayload[],
      );

      const dbOrders = await OrderModel.bulkCreate(
        finalOrders.map((order) => {
          const orderResponse = response.successResponse.find(
            (req) => req.orderNumber === order.orderId,
          );
          return Orders.buildCreate(order, courierProvider, orderResponse);
        }),
      );

      logger.info({ message: 'Bulk Order created', orderIds: dbOrders.map((order) => order.id) });


      const trackingHistoryPayload = dbOrders.map((order) => {
        const orderPayload = mappedRequests.find(
          (payload) => payload.orderNumber === order.orderId,
        ) as
          | CourierProvider.Mock.Types.IMockShipmentPayload
          | CourierProvider.Urbanebolt.Types.IShipmentPayload;
        const orderResponse = response.successResponse.find(
          (orderResponse) => orderResponse.orderNumber === order.orderId,
        ) as
          | CourierProvider.Mock.Types.IMockOrderSuccessResponse
          | CourierProvider.Urbanebolt.Types.IOrderSuccessResponse;
        return {
          orderId: order.id,
          action: TRACKING_ACTIONS.CREATE,
          requestPayload: orderPayload,
          responsePayload: orderResponse,
          status: ORDER_STATUSES.CREATED,
        };
      });

      // Bulk create tracking history
      TrackingHistoryModel.bulkCreate(
        trackingHistoryPayload as unknown as InferCreationAttributes<TrackingHistoryModel>[],
      );

      return {
        failedOrders,
        successOrders: dbOrders.map((order) => ({
          id: order.id,
          orderNumber: order.orderId,
          courierOrderId: order.courierOrderId,
          awbNumber: order.awbNumber?.toString() ?? '',
          status: order.status,
        })),
      };
    } catch (error) {
      if (error instanceof RouteError) {
        throw error;
      }

      throw new RouteError(
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        `Failed to create bulk order: ${(error as Error).message}`,
      );
    }
  }

  static async trackOrder(orderId: string): Promise<ITrackOrderResponse> {
    try {
      const dbOrder = await OrderModel.findByPk(orderId, {
        raw: true,
        attributes: ['id', 'courierProvider', 'awbNumber', 'status'],
      });

      if (!dbOrder) {
        throw new RouteError(
          HttpStatusCodes.BAD_REQUEST,
          `Order with id "${orderId}" not found`,
        );
      }

      const courierProvider = dbOrder.courierProvider;

      const client =
        await CourierProvider.CourierFactory.Factory.getProvider(
          courierProvider,
        );

      const response = await client.trackOrder(dbOrder.awbNumber as string);
      const mappedResponse =
        CourierProvider.Mappers.ShipmentMapper.mapTrackOrderResponse(
          courierProvider,
          response,
        );

      return {
        id: dbOrder.id,
        ...mappedResponse,
        status: dbOrder.status,
      };
    } catch (error) {
      if (error instanceof RouteError) {
        throw error;
      }
      throw new RouteError(
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        `Failed to track order: ${(error as Error).message}`,
      );
    }
  }

  static async cancelOrder(orderId: string): Promise<ICancelOrderResponse> {
    try {
      const dbOrder = await OrderModel.findByPk(orderId, {
        raw: true,
        attributes: ['id', 'courierProvider', 'awbNumber', 'status'],
      });

      if (!dbOrder) {
        throw new RouteError(
          HttpStatusCodes.BAD_REQUEST,
          `Order with id "${orderId}" not found`,
        );
      }

      const courierProvider = dbOrder.courierProvider;

      const client =
        await CourierProvider.CourierFactory.Factory.getProvider(
          courierProvider,
        );

      const response = await client.cancelOrder(dbOrder.awbNumber as string);

      await OrderModel.update(
        {
          status: ORDER_STATUSES.CANCELLED,
        },
        { where: { id: orderId } },
      );

      // Update tracking history
      TrackingHistoryModel.create({
        orderId,
        action: TRACKING_ACTIONS.CANCEL,
        status: ORDER_STATUSES.CANCELLED,
        requestPayload: { awbs: dbOrder.awbNumber },
        responsePayload: response as unknown as Record<string, unknown>,
      });

      const mappedResponse =
        CourierProvider.Mappers.ShipmentMapper.mapCancelOrderResponse(
          courierProvider,
          response,
        );

      return {
        id: orderId,
        ...mappedResponse,
        status: ORDER_STATUSES.CANCELLED,
      };
    } catch (error) {
      if (error instanceof RouteError) {
        throw error;
      }
      throw new RouteError(
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        `Failed to cancel order: ${(error as Error).message}`,
      );
    }
  }

  private static buildCreate(
    order: IGenericShipmentOrderItem,
    courierProvider: CourierProviderName,
    response?:
      | CourierProvider.Mock.Types.IMockOrderSuccessResponse
      | CourierProvider.Urbanebolt.Types.IOrderSuccessResponse,
  ) {
    return {
      orderId: order.orderId,
      customerId: order.customerId,
      courierProvider,
      courierOrderId: null,
      awbNumber: response?.awbNumber.toString() ?? null,
      status: ORDER_STATUSES.CREATED,
    };
  }
}
