import type {
  IDimensions,
  IGenericShipmentPayload,
  PaymentMode,
  ServiceType,
} from '@src/types';

export interface IToken {
  access_token: string;
  expires_in: number;
  token_type: string;
  expires: string;
  status: string;
}

export interface IShipmentPayload extends IDimensions {
  customerCode: string;
  orderNumber: string;
  declaredValue: number;
  itemDescription: string;
  collectableValue: number;
  serviceType: ServiceType;
  payMode: PaymentMode;
  pieces: number;

  /**
   * Consignee Details
   */
  consName: string;
  consMobile: string;
  consEmail?: string;
  consAddress: string;
  consCity: string;
  consState: string;
  consCountry: string;
  consPincode: string;
  consAddressType: string;

  /**
   * Shipper Details
   */
  shprName: string;
  shprMobile: string;
  shprEmail?: string;
  shprAddress: string;
  shprCity: string;
  shprState: string;
  shprCountry: string;
  shprPincode: string;
  shprAddressType: string;

  /**
   * Return Details
   */
  rtnName: string;
  rtnMobile: string;
  rtnEmail?: string;
  rtnAddress: string;
  rtnCity: string;
  rtnState: string;
  rtnCountry: string;
  rtnPincode: string;
  rtnAddressType: string;

  /**
   * Invoice Details
   */
  invoiceNumber: string;
  invoiceDate: string | Date;
  invoiceValue: number;
  itemQuantity: number;
}

export interface IOrderSuccessResponse {
  status: string;
  orderNumber: string;
  awbNumber: number;
  routeCode: string;
  shippingLabel: string;
  customerCode: string;
}

export interface IOrderErrorResponse {
  orderNumber: string;
  customerCode: string;
  status: string;
  message: string;
}

export interface IOrderResponse {
  status: string;
  successResponse: IOrderSuccessResponse[];
  errorResponse: IOrderErrorResponse[];
}

export type Operation = 'manifest' | 'tracking' | 'cancel';

export const OPERATIONS: { [key in Operation]: string } = {
  manifest: 'manifest',
  tracking: 'tracking',
  cancel: 'cancel',
};

interface ITrackingScan {
  statusDateTime: string;
  statusCode: string;
  statusCodeDescription: string;
  reasonCode: string;
  reasonCodeDescription: string;
  currentLocation: string;
}

interface ITrackingData {
  awbNumber: number;
  orderNumber: string;
  pieces: number;

  addedOn: string;
  invoiceDate: string;
  invoiceNumber: string;

  remarks: string | null;

  shipperName: string;
  origin: string;
  destination: string;
  currentLocation: string;

  edd: string;
  currentStatusDateTime: string;

  currentStatusCode: string;
  currentStatusCodeDescription: string;

  currentReasonCode: string;
  currentReasonCodeDescription: string;

  isRto: boolean;

  weight: number;

  referenceAwb: string | null;

  lat: number;
  lng: number;

  productType: string;

  delOtpVerified: boolean;
  pickupOtpVerified: boolean;
  rtoOtpVerified: boolean;

  delPod: string;
  pickupPod: string;

  rto_status: number;

  scans: ITrackingScan[];
}

export interface ITrackingResponse {
  status: string;
  message: string;
  data: ITrackingData;
}

interface ICancelOrderSuccessFailureResponse extends Pick<
  IOrderSuccessResponse,
  'orderNumber'
> {
  awb: string;
  message: string;
}

export interface ICancelOrderResponse extends Pick<IOrderResponse, 'status'> {
  message: string;
  successResponse: ICancelOrderSuccessFailureResponse[];
  failureResponse: ICancelOrderSuccessFailureResponse[];
}
