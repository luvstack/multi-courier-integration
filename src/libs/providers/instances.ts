import axios from 'axios';

import { env } from '../../../config/env';

export const urbaneboltInstance = axios.create({
  baseURL: `${env.urbanebolt.baseUrl}/api/${env.urbanebolt.apiVersion}`,
  timeout: env.urbanebolt.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});
