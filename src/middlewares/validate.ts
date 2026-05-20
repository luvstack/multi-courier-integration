import { NextFunction, Request, Response } from 'express';
import { ObjectSchema } from 'joi';

function sendValidationError(
  res: Response,
  error: { details: { path: (string | number)[]; message: string }[] },
): void {
  res.status(400).json({
    code: 'VALIDATION_ERROR',
    message: 'Request validation failed',
    details: error.details.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    })),
    requestId: (res.locals as { requestId?: string }).requestId,
  });
}

function validateSource(
  source: Record<string, unknown>,
  schema: ObjectSchema,
  assign: (value: unknown) => void,
  res: Response,
  next: NextFunction,
): void {
  const { error, value } = schema.validate(source, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    sendValidationError(res, error);
    return;
  }

  assign(value);
  next();
}

export const validateBody =
  (schema: ObjectSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const body =
      req.body !== undefined &&
      req.body !== null &&
      typeof req.body === 'object'
        ? req.body
        : {};

    validateSource(
      body,
      schema,
      (value) => {
        req.body = value;
      },
      res,
      next,
    );
  };

export const validateParams =
  (schema: ObjectSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    validateSource(
      req.params,
      schema,
      (value) => {
        req.params = value as typeof req.params;
      },
      res,
      next,
    );
  };

export const validateQuery =
  (schema: ObjectSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    validateSource(
      req.query,
      schema,
      (value) => {
        req.query = value as typeof req.query;
      },
      res,
      next,
    );
  };
