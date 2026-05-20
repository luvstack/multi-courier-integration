import axios from 'axios';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';

import { CourierProvider } from '../..';
import { urbaneboltInstance } from '../instances';
import {
  ICancelOrderResponse,
  IOrderResponse,
  IShipmentPayload,
  ITrackingResponse,
  Operation,
  OPERATIONS,
} from './types';

export class Order implements CourierProvider.Types.ICourier {
  private readonly headers: Record<string, string>;

  constructor(accessToken: string) {
    this.headers = {
      Authorization: `Bearer ${accessToken}`,
    };
  }

  async createOrder(payload: IShipmentPayload[]): Promise<IOrderResponse> {
    try {
      const { data } = await urbaneboltInstance.post<IOrderResponse>(
        '/services/manifest/',
        payload,
        { headers: this.headers },
      );

      this.assertUrbaneboltResponse(data, OPERATIONS.manifest as Operation);
      return data;
    } catch (error) {
      if (error instanceof RouteError) {
        throw error;
      }

      if (axios.isAxiosError(error)) {
        throw new RouteError(
          HttpStatusCodes.BAD_REQUEST,
          `Urbanebolt createOrder failed: ${error.response?.status ?? error.code} - ${error.message}`,
          'COURIER_ERROR',
        );
      }

      throw error;
    }
  }

  private assertUrbaneboltResponse(
    data: IOrderResponse | ITrackingResponse | ICancelOrderResponse,
    operation: Operation,
  ): void {
    if (data.status !== 'Success') {
      throw new RouteError(
        HttpStatusCodes.BAD_REQUEST,
        `Urbanebolt ${operation} failed with status: ${data.status}`,
      );
    }

    switch (operation) {
      case OPERATIONS.manifest: {
        this.assertManifestPayload(data as IOrderResponse);
        break;
      }
      case OPERATIONS.tracking: {
        this.assertTrackingPayload(data as ITrackingResponse);
        break;
      }
      case OPERATIONS.cancel: {
        this.assertCancelOrderPayload(data as ICancelOrderResponse);
        break;
      }
      default: {
        throw new RouteError(
          HttpStatusCodes.BAD_REQUEST,
          `Invalid operation: ${operation}`,
        );
      }
    }
  }

  private assertManifestPayload(data: IOrderResponse): void {
    if (data.errorResponse?.length && !data.successResponse.length) {
      const messages = data.errorResponse
        .map((err) => `${err.orderNumber}: ${err.message}`)
        .join('; ');

      throw new RouteError(HttpStatusCodes.BAD_REQUEST, messages);
    }

    if (!data.successResponse?.length) {
      throw new RouteError(
        HttpStatusCodes.BAD_REQUEST,
        'Urbanebolt manifest returned no successful orders',
      );
    }
  }
  private assertCancelOrderPayload(data: ICancelOrderResponse): void {
    if (data.failureResponse?.length) {
      const messages = data.failureResponse
        .map((err) => `${err.awb}: ${err.message}`)
        .join('; ');

      throw new RouteError(HttpStatusCodes.BAD_REQUEST, messages);
    }
  }

  private assertTrackingPayload(data: ITrackingResponse): void {
    if (!data.data) {
      throw new RouteError(
        HttpStatusCodes.NOT_FOUND,
        data.message || 'Urbanebolt tracking returned no data',
      );
    }
  }

  async trackOrder(trackingNumber: string): Promise<ITrackingResponse> {
    try {
      const { data } = await urbaneboltInstance.get<ITrackingResponse>(
        '/services/tracking-pub/',
        {
          headers: this.headers,
          params: { awb: trackingNumber },
        },
      );

      this.assertUrbaneboltResponse(data, OPERATIONS.tracking as Operation);

      return data;
    } catch (error) {
      if (error instanceof RouteError) {
        throw error;
      }

      if (axios.isAxiosError(error)) {
        throw new RouteError(
          HttpStatusCodes.BAD_REQUEST,
          `Urbanebolt trackOrder failed: ${error.response?.status ?? error.code} - ${error.message}`,
          'COURIER_ERROR',
        );
      }

      throw error;
    }
  }

  async cancelOrder(trackingNumber: string): Promise<ICancelOrderResponse> {
    try {
      const { data } = await urbaneboltInstance.post<ICancelOrderResponse>(
        '/services/cancel/',
        { awbs: trackingNumber },
        { headers: this.headers },
      );

      this.assertUrbaneboltResponse(data, OPERATIONS.cancel as Operation);

      return data;
    } catch (error) {
      if (error instanceof RouteError) {
        throw error;
      }

      if (axios.isAxiosError(error)) {
        throw new RouteError(
          HttpStatusCodes.BAD_REQUEST,
          `Urbanebolt cancelOrder failed: ${error.response?.status ?? error.code} - ${error.message}`,
          'COURIER_ERROR',
        );
      }
      throw error;
    }
  }
}
