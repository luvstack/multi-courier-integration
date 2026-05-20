import logger from 'jet-logger';
import { Options, Sequelize } from 'sequelize';

import { env } from '../../config/env';

function buildOptions(): Options {
  return {
    dialect: env.db.dialect,
    logging: env.db.logging ? (msg: string) => logger.info(msg) : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      underscored: true,
      timestamps: true,
    },
    dialectOptions: env.db.ssl
      ? { ssl: { require: true, rejectUnauthorized: false } }
      : undefined,
  };
}

export const sequelize = env.db.url
  ? new Sequelize(env.db.url, buildOptions())
  : new Sequelize({
      ...buildOptions(),
      host: env.db.host,
      port: env.db.port,
      database: env.db.name,
      username: env.db.user,
      password: env.db.password,
    });

export async function connectDb(): Promise<void> {
  await sequelize.authenticate();
  logger.info('PostgreSQL connection established');
}

export async function disconnectDb(): Promise<void> {
  await sequelize.close();
  logger.info('PostgreSQL connection closed');
}
