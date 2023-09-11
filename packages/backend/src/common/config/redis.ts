import { RedisOptions } from 'ioredis'

import { envConfig } from '@common/config/env'

const redisConfig: RedisOptions = {
  host: envConfig.REDIS_HOST,
  port: Number(envConfig.REDIS_PORT),
  username: envConfig.REDIS_USER || undefined,
  password: envConfig.REDIS_PASS || undefined,
  db: Number(envConfig.REDIS_DB || 0),
  retryStrategy: () => 2000,
  reconnectOnError: () => true,
  connectTimeout: 5000,
}

export { redisConfig }
