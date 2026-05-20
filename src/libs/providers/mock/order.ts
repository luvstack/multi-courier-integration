import { DateTime } from 'luxon';

import { CourierProvider } from '../../';
import type {
  IMockCancelResponse,
  IMockOrderResponse,
  IMockShipmentPayload,
  IMockTrackingResponse,
} from './types';

export class Order implements CourierProvider.Types.ICourier {
  async createOrder(
    payload: IMockShipmentPayload[],
  ): Promise<IMockOrderResponse> {
    const successResponse = payload.map((p) => ({
      orderNumber: p.orderNumber,
      awbNumber: `MOCK-AWB-${p.orderNumber}`,
      status: 'Success',
    }));
    return {
      status: 'Success',
      message: 'Order created successfully',
      successResponse,
    };
  }

  async trackOrder(awbNumber: string): Promise<IMockTrackingResponse> {
    return {
      status: 'Success',
      message: 'Tracking data found',
      data: {
        awbNumber,
        orderNumber: awbNumber.replace('MOCK-AWB-', ''),
        currentStatusCode: 'IN_TRANSIT',
        currentStatusCodeDescription: 'Shipment is in transit',
        scans: [
          {
            statusDateTime: DateTime.now().toISO({ includeOffset: false }),
            statusCode: 'IN_TRANSIT',
            statusCodeDescription: 'Shipment is in transit',
          },
        ],
      },
    };
  }

  async cancelOrder(awbNumber: string): Promise<IMockCancelResponse> {
    return {
      status: 'Success',
      message: 'Order cancelled successfully',
      successResponse: [
        {
          orderNumber: awbNumber.replace('MOCK-AWB-', ''),
          awb: awbNumber,
          message: 'Order cancelled successfully',
        },
      ],
      failureResponse: [],
    };
  }
}
