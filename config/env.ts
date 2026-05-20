import dotenv from "dotenv";

dotenv.config();

export const env = {

  port: process.env.PORT || 3000,

  nodeEnv: process.env.NODE_ENV || "development",

  db: {
    url: process.env.DATABASE_URL || "",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    name: process.env.DB_NAME || "courier_platform",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    dialect: (process.env.DB_DIALECT || "postgres") as "postgres",
    logging: process.env.DB_LOGGING === "true",
    // SSL on by default when using a remote DATABASE_URL with sslmode=require,
    // or explicitly via DB_SSL=true
    ssl:
      process.env.DB_SSL === "true" ||
      /sslmode=require/i.test(process.env.DATABASE_URL || ""),
  },

  urbanebolt: {
    baseUrl: process.env.URBANEBOLT_BASE_URL || "",
    apiVersion: process.env.URBANEBOLT_API_VERSION || "",
    timeout: Number(process.env.URBANEBOLT_TIMEOUT) || 10000,
    username: process.env.URBANEBOLT_USERNAME || "",
    password: process.env.URBANEBOLT_PASSWORD || "",
  },

  retry: {
    count: Number(process.env.COURIER_RETRY_COUNT) || 3,
  },

  redis: {
    url: process.env.REDIS_URL || "",
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || "",
    tls:
      process.env.REDIS_TLS === "true" ||
      /^rediss:\/\//i.test(process.env.REDIS_URL || ""),
  }
};