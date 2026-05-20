import { ParseError } from 'jet-validators/utils';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';

/******************************************************************************
                                 Helpers
******************************************************************************/

function defaultCodeForStatus(status: HttpStatusCodes): string {
  const map: Partial<Record<HttpStatusCodes, string>> = {
    [HttpStatusCodes.BAD_REQUEST]: 'BAD_REQUEST',
    [HttpStatusCodes.UNAUTHORIZED]: 'UNAUTHORIZED',
    [HttpStatusCodes.FORBIDDEN]: 'FORBIDDEN',
    [HttpStatusCodes.NOT_FOUND]: 'NOT_FOUND',
    [HttpStatusCodes.CONFLICT]: 'CONFLICT',
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: 'UNPROCESSABLE_ENTITY',
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: 'INTERNAL_SERVER_ERROR',
  };
  return map[status] ?? 'ERROR';
}

/******************************************************************************
                                 Classes
******************************************************************************/

/**
 * Error with HTTP status, machine-readable code, and message.
 * Produces the unified error envelope: { code, message, requestId? }.
 */
export class RouteError extends Error {
  public status: HttpStatusCodes;
  public code: string;

  public constructor(status: HttpStatusCodes, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code ?? defaultCodeForStatus(status);
  }
}

/**
 * Handle "parseObj" errors.
 */
export class ValidationError extends RouteError {
  public static MESSAGE =
    'The parseObj() function discovered one or ' + 'more errors.';

  public constructor(errors: ParseError[]) {
    const msg = JSON.stringify({
      message: ValidationError.MESSAGE,
      errors,
    });
    super(HttpStatusCodes.BAD_REQUEST, msg, 'VALIDATION_ERROR');
  }
}
