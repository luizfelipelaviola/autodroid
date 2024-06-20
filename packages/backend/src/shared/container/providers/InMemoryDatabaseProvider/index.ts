// Provider import
import { Redis, RedisOptions } from "ioredis";

// Implementation import
import { RedisInMemoryDatabaseProvider } from "./implementations/redisInMemoryDatabase.provider";

// Type import
import {
  IInMemoryDatabaseProvider,
  InMemoryDatabaseProviderAdapter,
} from "./models/IInMemoryDatabase.provider";

const providers = {
  Redis: RedisInMemoryDatabaseProvider,
};

class InMemoryDatabaseProvider implements IInMemoryDatabaseProvider {
  public readonly initialization: Promise<void>;

  connection: Redis;
  Adapter: new (
    connection_name: string,
    adapter_options?:
      | ((defaultOptions: RedisOptions) => RedisOptions)
      | undefined,
  ) => InMemoryDatabaseProviderAdapter;

  constructor(client: RedisInMemoryDatabaseProvider = new providers.Redis()) {
    this.Adapter = providers.Redis;

    const instance = client;
    this.connection = instance.provider;
    this.initialization = instance.initialization;
  }
}

export { InMemoryDatabaseProvider };
