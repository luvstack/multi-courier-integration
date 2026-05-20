import { env } from '../../../config/env';

/******************************************************************************
                                 Constants
******************************************************************************/

// NOTE: These need to match the names of your ".env" files
export const NodeEnvs = {
  DEV: 'development',
  TEST: 'test',
  PRODUCTION: 'production',
} as const;

/******************************************************************************
                                 Setup
******************************************************************************/

const EnvVars = {
  NodeEnv: env.nodeEnv,
  Port: Number(env.port),
};

/******************************************************************************
                            Export default
******************************************************************************/

export default EnvVars;
export { env };
