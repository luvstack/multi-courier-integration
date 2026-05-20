import { CourierProvider } from '@src/libs';
import {
  ICancelMappedResponse,
  ICreateOrderMappedResponse,
  ITrackMappedResponse,
} from '@src/libs/providers/types';
import { IOrderErrorResponse } from '@src/libs/providers/urbanebolt/types';

export interface IDimensions {
  length: number;
  breadth: number;
  height: number;
  weight: number;
}

interface ICustomer {
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

interface IItem {
  name: string;
  quantity: number;
  price: number;
}

export type PaymentMode = 'COD' | 'PPD';
export type ServiceType = 'SDD' | 'RTO';

export const PAYMENT_MODES: { [key in PaymentMode]: key } = {
  COD: 'COD',
  PPD: 'PPD',
};

export const SERVICE_TYPES: { [key in ServiceType]: key } = {
  SDD: 'SDD',
  RTO: 'RTO',
};

export interface IGenericShipmentOrderItem {
  customerId: string;
  orderId: string;
  paymentMode: PaymentMode;
  declaredValue: number;
  dimensions: IDimensions;
  customer: ICustomer;
  shipper: ICustomer;
  items: Array<IItem>;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceValue: number;
}

export interface IGenericShipmentPayload extends IGenericShipmentOrderItem {
  courierProvider: CourierProvider.Types.CourierProvider;
}

export interface IBulkOrderPayload {
  courierProvider: CourierProvider.Types.CourierProvider;
  orders: IGenericShipmentOrderItem[];
}

export type OrderStatus =
  | 'PENDING'
  | 'CREATED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'FAILED';
export type TrackingAction = 'CREATE' | 'UPDATE' | 'CANCEL' | 'STATUS_UPDATE';

export const TRACKING_ACTIONS: { [key in TrackingAction]: key } = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  CANCEL: 'CANCEL',
  STATUS_UPDATE: 'STATUS_UPDATE',
};

export const ORDER_STATUSES: { [key in OrderStatus]: key } = {
  PENDING: 'PENDING',
  CREATED: 'CREATED',
  PICKED_UP: 'PICKED_UP',
  IN_TRANSIT: 'IN_TRANSIT',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  FAILED: 'FAILED',
};

export interface IOrderResponse {
  successOrders: ICreateOrderMappedResponse['successOrders'];
  failedOrders: ICreateOrderMappedResponse['failedOrders'];
}

export interface ITrackOrderResponse extends ITrackMappedResponse {
  id: string;
  status: OrderStatus;
}

export interface ICancelOrderResponse extends ICancelMappedResponse {
  id: string;
  status: OrderStatus;
}
