import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import { CourierProvider } from '@src/libs';

import { Types } from '..';

export class Factory {
  static async getProvider(courierPartner: Types.CourierProvider) {
    switch (courierPartner) {
      case Types.COURIER_PROVIDERS.urbanebolt: {
        const urbaneboltAcessToken =
          await CourierProvider.Urbanebolt.Urbanebolt.getAccessToken();
        return new CourierProvider.Urbanebolt.UrbaneboltOrder(
          urbaneboltAcessToken,
        );
      }
      case Types.COURIER_PROVIDERS.mock: {
        return new CourierProvider.Mock.MockOrder();
      }
      default: {
        throw new RouteError(
          HttpStatusCodes.BAD_REQUEST,
          `Unsupported courier partner: ${courierPartner}`,
        );
      }
    }
  }
}
