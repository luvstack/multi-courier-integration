export interface IMockShipmentPayload {
  orderNumber: string;
  customerId: string;
  declaredValue: number;
  awbNumber?: string;
}

export interface IMockOrderSuccessResponse {
  orderNumber: string;
  awbNumber: string;
  status: string;
}

export interface IMockOrderResponse {
  status: string;
  message: string;
  successResponse: IMockOrderSuccessResponse[];
}

export interface IMockTrackingData {
  awbNumber: string;
  orderNumber: string;
  currentStatusCode: string;
  currentStatusCodeDescription: string;
  scans: {
    statusDateTime: string;
    statusCode: string;
    statusCodeDescription: string;
  }[];
}

export interface IMockTrackingResponse {
  status: string;
  message: string;
  data: IMockTrackingData | null;
}

export interface IMockCancelResponse {
  status: string;
  message: string;
  successResponse: { orderNumber: string; awb: string; message: string }[];
  failureResponse: { orderNumber: string; awb: string; message: string }[];
}
