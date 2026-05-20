import axios from 'axios';
import logger from 'jet-logger';

import { env } from '../../../../config/env';
import { redis } from '../../../db/redis';
import { urbaneboltInstance } from '../instances';
import type { Types } from './';

const TOKEN_CACHE_KEY = 'urbanebolt:access_token';
// Refresh slightly before actual expiry to avoid edge-of-window failures.
const TOKEN_EXPIRY_SAFETY_SECONDS = 60;

export class Urbanebolt {
  static async generateAccessToken(): Promise<string> {
    try {
      const { data } = await urbaneboltInstance.post<Types.IToken>(
        '/auth/getToken/',
        {
          username: env.urbanebolt.username,
          password: env.urbanebolt.password,
        },
      );

      const { access_token: accessToken, expires_in: expiresIn, status } = data;

      if (status !== 'Success') {
        throw new Error('Failed to generate access token');
      }

      const ttl = Math.max(
        expiresIn - TOKEN_EXPIRY_SAFETY_SECONDS,
        TOKEN_EXPIRY_SAFETY_SECONDS,
      );

      await redis.set(TOKEN_CACHE_KEY, accessToken, 'EX', ttl);

      return accessToken;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Urbanebolt getToken failed: ${error.response?.status ?? error.code} - ${error.message}`,
        );
      }
      throw error;
    }
  }

  static async getAccessToken(): Promise<string> {
    const cached = await redis.get(TOKEN_CACHE_KEY);
    if (cached) {
      return cached;
    }

    logger.info('Urbanebolt access token not cached, generating new one');
    return this.generateAccessToken();
  }
}
