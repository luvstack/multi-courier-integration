import type { IGenericShipmentPayload } from '@src/types';

import { Mock, Urbanebolt } from '.';

export interface IAcessToken {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  expiresAt: number;
}

export type CourierProvider = 'urbanebolt' | 'mock';

export const COURIER_PROVIDERS: { [key in CourierProvider]: key } = {
  mock: 'mock',
  urbanebolt: 'urbanebolt',
};

export interface IOrderResult {
  orderNumber: string;
  awbNumber: string;
  status: string;
}

export interface ICreateOrderMappedResponse {
  successOrders: IOrderResult[];
  failedOrders: { orderNumber: string; message: string }[];
}

export interface ITrackingScan {
  statusDateTime: string;
  statusCode: string;
  statusCodeDescription: string;
}

export interface ITrackMappedResponse {
  awbNumber: string;
  orderNumber: string;
  currentStatus: string;
  currentStatusDescription: string;
  scans: ITrackingScan[];
}

export interface ICancelMappedResponse {
  successOrders: { orderNumber: string; awb: string }[];
  failedOrders: { orderNumber: string; awb: string; message: string }[];
}

export interface ICourier {
  createOrder(
    payload:
      | Urbanebolt.Types.IShipmentPayload[]
      | Mock.Types.IMockShipmentPayload[],
  ): Promise<Urbanebolt.Types.IOrderResponse | Mock.Types.IMockOrderResponse>;
  trackOrder(
    awbNumber: string,
  ): Promise<
    Urbanebolt.Types.ITrackingResponse | Mock.Types.IMockTrackingResponse
  >;
  cancelOrder(
    awbNumber: string,
  ): Promise<
    Urbanebolt.Types.ICancelOrderResponse | Mock.Types.IMockCancelResponse
  >;
}

export interface ICourierMapper {
  generateShipmentPayload(
    payload: Omit<IGenericShipmentPayload, 'courierProvider'>,
  ): Urbanebolt.Types.IShipmentPayload | Mock.Types.IMockShipmentPayload;
  mapCreateOrderResponse(
    data: Urbanebolt.Types.IOrderResponse | Mock.Types.IMockOrderResponse,
  ): ICreateOrderMappedResponse;
  mapTrackOrderResponse(
    data: Urbanebolt.Types.ITrackingResponse | Mock.Types.IMockTrackingResponse,
  ): ITrackMappedResponse;
  mapCancelOrderResponse(
    data:
      | Urbanebolt.Types.ICancelOrderResponse
      | Mock.Types.IMockCancelResponse,
  ): ICancelMappedResponse;
}
