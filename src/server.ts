import crypto from 'crypto';

import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import logger from 'jet-logger';
import morgan from 'morgan';
import path from 'path';

import Paths from '@src/common/constants/Paths';
import { RouteError } from '@src/common/utils/route-errors';
import routes from '@src/routes';

import { env, NodeEnvs } from './common/constants/env';

/******************************************************************************
                                Setup
******************************************************************************/

const app = express();

// **** Middleware **** //

// Attach a unique request ID so every response (including errors) carries it.
app.use((_req: Request, res: Response, next: NextFunction) => {
  const id =
    (_req.headers['x-request-id'] as string | undefined) ??
    crypto.randomUUID();
  res.locals['requestId'] = id;
  res.setHeader('X-Request-Id', id);
  next();
});

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Show routes called in console during development
if (env.nodeEnv === NodeEnvs.DEV) {
  app.use(morgan('dev'));
}

// Security
if (env.nodeEnv === NodeEnvs.PRODUCTION) {
  app.use(helmet());
}

// Add APIs, must be after middleware
app.use('/api/v1', routes); // e.g. POST /api/v1/orders

// Unified error handler — single response shape: { code, message, details?, requestId }
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (env.nodeEnv !== NodeEnvs.TEST.valueOf()) {
    logger.err(err, true);
  }

  const requestId = (res.locals as { requestId?: string }).requestId;

  if (err instanceof RouteError) {
    res.status(err.status).json({
      code: err.code,
      message: err.message,
      requestId,
    });
  } else {
    res.status(500).json({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      requestId,
    });
  }
});

// **** FrontEnd Content **** //

// Set views directory (html)
const viewsDir = path.join(__dirname, 'views');
app.set('views', viewsDir);

// Set static directory (js and css).
const staticDir = path.join(__dirname, 'public');
app.use(express.static(staticDir));

// Nav to users pg by default
app.get('/', (_: Request, res: Response) => {
  return res.redirect('/users');
});

// Redirect to login if not logged in.
app.get('/users', (_: Request, res: Response) => {
  return res.sendFile('users.html', { root: viewsDir });
});

/******************************************************************************
                                Export default
******************************************************************************/

export default app;
