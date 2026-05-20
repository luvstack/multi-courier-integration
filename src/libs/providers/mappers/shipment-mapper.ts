import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import type { IGenericShipmentOrderItem } from '@src/types';

import type { Mock, Urbanebolt } from '..';
import { MockMapper } from '../mock';
import {
  COURIER_PROVIDERS,
  type CourierProvider,
  type ICancelMappedResponse,
  type ICreateOrderMappedResponse,
  type ITrackMappedResponse,
} from '../types';
import { UrbaneboltMapper } from '../urbanebolt';

export class ShipmentMapper {
  static mapOrders(
    courierProvider: CourierProvider,
    orders: IGenericShipmentOrderItem[],
  ) {
    switch (courierProvider) {
      case COURIER_PROVIDERS.urbanebolt: {
        return orders.map((order) =>
          UrbaneboltMapper.Mapper.generateShipmentPayload(order),
        );
      }
      case COURIER_PROVIDERS.mock: {
        return orders.map((order) =>
          MockMapper.Mapper.generateShipmentPayload(order),
        );
      }
      default: {
        throw new RouteError(
          HttpStatusCodes.BAD_REQUEST,
          `Unsupported courier provider: ${courierProvider}`,
        );
      }
    }
  }

  static mapCreateOrderResponse(
    courierProvider: CourierProvider,
    data: Urbanebolt.Types.IOrderResponse | Mock.Types.IMockOrderResponse,
  ): ICreateOrderMappedResponse {
    switch (courierProvider) {
      case COURIER_PROVIDERS.urbanebolt: {
        const response = data as Urbanebolt.Types.IOrderResponse;
        return UrbaneboltMapper.Mapper.mapCreateOrderResponse(response);
      }
      case COURIER_PROVIDERS.mock: {
        const response = data as Mock.Types.IMockOrderResponse;
        return MockMapper.Mapper.mapCreateOrderResponse(response);
      }
      default: {
        throw new RouteError(
          HttpStatusCodes.BAD_REQUEST,
          `Unsupported courier provider: ${courierProvider}`,
        );
      }
    }
  }

  static mapTrackOrderResponse(
    courierProvider: CourierProvider,
    data: Urbanebolt.Types.ITrackingResponse | Mock.Types.IMockTrackingResponse,
  ): ITrackMappedResponse {
    switch (courierProvider) {
      case COURIER_PROVIDERS.urbanebolt: {
        const response = data as Urbanebolt.Types.ITrackingResponse;
        return UrbaneboltMapper.Mapper.mapTrackOrderResponse(response);
      }
      case COURIER_PROVIDERS.mock: {
        const response = data as Mock.Types.IMockTrackingResponse;
        return MockMapper.Mapper.mapTrackOrderResponse(response);
      }
      default: {
        throw new RouteError(
          HttpStatusCodes.BAD_REQUEST,
          `Unsupported courier provider: ${courierProvider}`,
        );
      }
    }
  }

  static mapCancelOrderResponse(
    courierProvider: CourierProvider,
    data:
      | Urbanebolt.Types.ICancelOrderResponse
      | Mock.Types.IMockCancelResponse,
  ): ICancelMappedResponse {
    switch (courierProvider) {
      case COURIER_PROVIDERS.urbanebolt: {
        const response = data as Urbanebolt.Types.ICancelOrderResponse;
        return UrbaneboltMapper.Mapper.mapCancelOrderResponse(response);
      }
      case COURIER_PROVIDERS.mock: {
        const response = data as Mock.Types.IMockCancelResponse;
        return MockMapper.Mapper.mapCancelOrderResponse(response);
      }
      default: {
        throw new RouteError(
          HttpStatusCodes.BAD_REQUEST,
          `Unsupported courier provider: ${courierProvider}`,
        );
      }
    }
  }
}
