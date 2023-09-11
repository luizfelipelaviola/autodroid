import Redis, { RedisOptions } from 'ioredis'

import { redisConfig } from '@common/config/redis'
import { executeAction } from '@common/util/executeAction'
import { InMemoryDatabaseProviderAdapter } from '../models/IInMemoryDatabase.provider'

class RedisInMemoryDatabaseProvider implements InMemoryDatabaseProviderAdapter {
  private inMemoryDatabaseProvider: Redis
  public readonly initialization: Promise<void>

  get provider() {
    return this.inMemoryDatabaseProvider
  }

  constructor(
    public readonly connection_name: string = 'default',
    adapter_options?: (defaultOptions: RedisOptions) => RedisOptions,
  ) {
    const options =
      typeof adapter_options === 'function'
        ? adapter_options(redisConfig)
        : redisConfig

    const redisClient = new Redis({
      ...options,
      lazyConnect: true,
    })

    redisClient.on('error', (message) =>
      console.log(`❌ Redis ${this.connection_name} error: "${message}"`),
    )

    redisClient.on('error', (err) =>
      console.log(
        `❌ Redis ${this.connection_name} disconnected ${err?.message || ''}`,
      ),
    )

    redisClient.on('reconnecting', () =>
      console.log(`🔄 Redis ${this.connection_name} reconnecting...`),
    )

    const healthCheck = async () => {
      try {
        await redisClient.ping()
      } catch (err: any) {
        console.log(
          `❌ Cannot reach Redis ${this.connection_name}. ${
            err?.message || ''
          }`,
        )
      }
    }

    this.initialization = executeAction({
      action: async () => {
        await redisClient.connect()
        await redisClient.ping()
      },
      actionName: `Redis ${this.connection_name} connection`,
      logging: true,
    })

    this.initialization.then(() => {
      setInterval(healthCheck, 10 * 1000)
    })

    this.inMemoryDatabaseProvider = redisClient
  }
}

export { RedisInMemoryDatabaseProvider }
