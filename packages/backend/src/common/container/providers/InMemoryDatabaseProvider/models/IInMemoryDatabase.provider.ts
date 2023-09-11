import { Redis, RedisOptions } from 'ioredis'

export type InMemoryDatabaseProvider = Redis
export type IMemoryDatabaseProviderConfig = RedisOptions

export abstract class InMemoryDatabaseProviderAdapter {
  public abstract readonly initialization: Promise<void>
  public abstract readonly provider: InMemoryDatabaseProvider
}

export interface IInMemoryDatabaseProvider {
  readonly initialization: Promise<void>

  connection: InMemoryDatabaseProvider
  Adapter: new (
    connection_name: string,
    adapter_options?: (
      defaultOptions: IMemoryDatabaseProviderConfig,
    ) => IMemoryDatabaseProviderConfig,
  ) => InMemoryDatabaseProviderAdapter
}
