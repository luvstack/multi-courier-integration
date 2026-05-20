import { CourierProvider } from '@src/libs';
import {
  IGenericShipmentPayload,
  PAYMENT_MODES,
  SERVICE_TYPES,
} from '@src/types';

import {
  ICancelMappedResponse,
  ICourierMapper,
  ICreateOrderMappedResponse,
  ITrackMappedResponse,
} from '../types';
import {
  ICancelOrderResponse,
  IOrderResponse,
  IShipmentPayload,
  ITrackingResponse,
} from './types';

export class Mapper {
  static generateShipmentPayload(
    payload: Omit<IGenericShipmentPayload, 'courierProvider'>,
  ): IShipmentPayload {
    const {
      customerId,
      orderId,
      paymentMode,
      declaredValue,
      dimensions,
      customer,
      items,
      invoiceNumber,
      invoiceDate,
      invoiceValue,
      shipper,
    } = payload;
    const { height, length, breadth, weight } = dimensions;
    const { name, phone, email, address, city, state, country, pincode } =
      customer;
    const {
      name: shipperName,
      phone: shipperPhone,
      email: shipperEmail,
      address: shipperAddress,
      city: shipperCity,
      state: shipperState,
      country: shipperCountry,
      pincode: shipperPincode,
    } = shipper;
    const itemQuantity = items.reduce((acc, item) => acc + item.quantity, 0);

    return {
      customerCode: customerId,
      orderNumber: orderId,
      declaredValue,
      itemDescription: items.map((item) => item.name).join(','),
      collectableValue: paymentMode === PAYMENT_MODES.COD ? declaredValue : 0,
      height,
      length,
      breadth,
      weight,
      pieces: itemQuantity,
      serviceType: SERVICE_TYPES.SDD,
      payMode: paymentMode,
      /**
       * consignee
       */

      consName: name,
      consMobile: phone,
      consEmail: email || '',
      consAddress: address,
      consCity: city,
      consState: state,
      consCountry: country,
      consPincode: pincode,
      consAddressType: 'Home',
      shprName: shipperName,
      shprMobile: shipperPhone,
      shprEmail: shipperEmail,
      shprAddress: shipperAddress,
      shprCity: shipperCity,
      shprState: shipperState,
      shprCountry: shipperCountry,
      shprPincode: shipperPincode,
      shprAddressType: 'Seller',

      /**
       * return
       */

      rtnName: shipperName,
      rtnMobile: shipperPhone,
      rtnEmail: shipperEmail,
      rtnAddress: shipperAddress,
      rtnCity: shipperCity,
      rtnState: shipperState,
      rtnCountry: shipperCountry,
      rtnPincode: shipperPincode,
      rtnAddressType: 'Home',

      /**
       * invoice
       */

      invoiceNumber,
      invoiceDate,
      invoiceValue,
      itemQuantity,
    };
  }

  static mapCreateOrderResponse(
    data: IOrderResponse,
  ): ICreateOrderMappedResponse {
    const { successResponse, errorResponse } = data;
    return {
      successOrders: successResponse.map((order) => ({
        orderNumber: order.orderNumber,
        awbNumber: String(order.awbNumber),
        status: order.status,
      })),
      failedOrders: errorResponse.map((error) => ({
        orderNumber: error.orderNumber,
        message: error.message,
      })),
    };
  }

  static mapTrackOrderResponse(data: ITrackingResponse): ITrackMappedResponse {
    const {
      awbNumber,
      orderNumber,
      currentStatusCode,
      currentStatusCodeDescription,
      scans,
    } = data.data;
    return {
      awbNumber: String(awbNumber),
      orderNumber: orderNumber,
      currentStatus: currentStatusCode,
      currentStatusDescription: currentStatusCodeDescription,
      scans: scans.map((scan) => ({
        statusDateTime: scan.statusDateTime,
        statusCode: scan.statusCode,
        statusCodeDescription: scan.statusCodeDescription,
      })),
    };
  }

  static mapCancelOrderResponse(
    data: ICancelOrderResponse,
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
