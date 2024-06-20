import { RedisOptions } from "ioredis";

// Configuration import
import { getEnvConfig } from "@config/env";

const getRedisConfig: () => RedisOptions = () => ({
  host: getEnvConfig().REDIS_HOST,
  port: Number(getEnvConfig().REDIS_PORT),
  username: getEnvConfig().REDIS_USER || undefined,
  password: getEnvConfig().REDIS_PASS || undefined,
  db: Number(getEnvConfig().REDIS_DB || 0),
  retryStrategy: () => 2000,
  reconnectOnError: () => true,
  connectTimeout: 5000,
  keyPrefix: undefined,
});

export { getRedisConfig };
