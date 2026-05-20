require('ts-node/register/transpile-only');

const { env } = require('./env');

const dialectOptions = env.db.ssl
  ? { ssl: { require: true, rejectUnauthorized: false } }
  : undefined;

const config = env.db.url
  ? {
      use_env_variable: 'DATABASE_URL',
      dialect: env.db.dialect,
      dialectOptions,
      migrationStorageTableName: '_migrations',
    }
  : {
      host: env.db.host,
      port: env.db.port,
      database: env.db.name,
      username: env.db.user,
      password: env.db.password,
      dialect: env.db.dialect,
      dialectOptions,
      migrationStorageTableName: '_migrations',
    };

module.exports = {
  development: config,
  test: config,
  production: config,
};
