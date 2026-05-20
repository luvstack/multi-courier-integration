import type { IGenericShipmentOrderItem } from '@src/types';

import {
  ICancelMappedResponse,
  ICourierMapper,
  ICreateOrderMappedResponse,
  ITrackMappedResponse,
} from '../types';
import type {
  IMockCancelResponse,
  IMockOrderResponse,
  IMockShipmentPayload,
  IMockTrackingResponse,
} from './types';

export class Mapper {
  static generateShipmentPayload(
    payload: Omit<IGenericShipmentOrderItem, 'courierProvider'>,
  ): IMockShipmentPayload {
    return {
      orderNumber: payload.orderId,
      customerId: payload.customerId,
      declaredValue: payload.declaredValue,
    };
  }

  static mapCreateOrderResponse(
    data: IMockOrderResponse,
  ): ICreateOrderMappedResponse {
    const { successResponse } = data;
    return {
      successOrders: successResponse.map((order) => ({
        orderNumber: order.orderNumber,
        awbNumber: order.awbNumber,
        status: order.status,
      })),
      failedOrders: [],
    };
  }

  static mapTrackOrderResponse(
    data: IMockTrackingResponse,
  ): ITrackMappedResponse {
    const {
      awbNumber,
      orderNumber,
      currentStatusCode,
      currentStatusCodeDescription,
      scans = [],
    } = data.data ?? {};
    return {
      awbNumber: awbNumber ?? '',
      orderNumber: orderNumber ?? '',
      currentStatus: currentStatusCode ?? '',
      currentStatusDescription: currentStatusCodeDescription ?? '',
      scans: scans.map((scan) => ({
        statusDateTime: scan.statusDateTime,
        statusCode: scan.statusCode,
        statusCodeDescription: scan.statusCodeDescription,
      })),
    };
  }

  static mapCancelOrderResponse(
    data: IMockCancelResponse,
  ): ICancelMappedResponse {
    const { successResponse, failureResponse } = data;
    return {
      successOrders: successResponse.map((order) => ({
        orderNumber: order.orderNumber,
        awb: order.awb,
      })),
      failedOrders: failureResponse.map((error) => ({
        orderNumber: error.orderNumber,
        awb: error.awb,
        message: error.message,
      })),
    };
  }
}

const mapper: ICourierMapper = Mapper;
