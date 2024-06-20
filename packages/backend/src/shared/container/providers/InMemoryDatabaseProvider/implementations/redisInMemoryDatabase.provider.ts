import { Redis, RedisOptions } from "ioredis";

// Configuration import
import { getRedisConfig } from "@config/redis";

// Util import
import { executeAction } from "@shared/utils/executeAction";

// Interface import
import { InMemoryDatabaseProviderAdapter } from "../models/IInMemoryDatabase.provider";

class RedisInMemoryDatabaseProvider implements InMemoryDatabaseProviderAdapter {
  private inMemoryDatabaseProvider: Redis;
  public readonly initialization: Promise<void>;

  private healthCheckInterval: NodeJS.Timeout;

  get provider() {
    return this.inMemoryDatabaseProvider;
  }

  constructor(
    public readonly connection_name: string = "default",
    adapter_options?: (defaultOptions: RedisOptions) => RedisOptions,
  ) {
    const redisConfig = getRedisConfig();

    const options =
      typeof adapter_options === "function"
        ? adapter_options(redisConfig)
        : redisConfig;

    const redisClient = new Redis({
      ...options,
      lazyConnect: true,
    });

    redisClient.on("error", message =>
      console.log(`❌ Redis ${this.connection_name} error: "${message}"`),
    );

    redisClient.on("error", err =>
      console.log(
        `❌ Redis ${this.connection_name} disconnected ${err?.message || ""}`,
      ),
    );

    redisClient.on("reconnecting", () =>
      console.log(`🔄 Redis ${this.connection_name} reconnecting...`),
    );

    redisClient.on("end", () => {
      clearInterval(this.healthCheckInterval);
      console.log(`🔄 Redis ${this.connection_name} connection closed`);
    });

    const healthCheck = async () => {
      try {
        await this.inMemoryDatabaseProvider.ping();
      } catch (err: any) {
        if (this.inMemoryDatabaseProvider.status === "end") return;
        console.log(
          `❌ Cannot reach Redis ${this.connection_name}. Status: ${
            this.inMemoryDatabaseProvider.status
          }. ${err?.message || ""} `,
        );
      }
    };

    this.initialization = executeAction({
      action: async () => {
        await redisClient.connect();
        await redisClient.ping();
      },
      actionName: `Redis ${this.connection_name} connection`,
      logging: true,
    });

    this.initialization.then(() => {
      this.healthCheckInterval = setInterval(healthCheck, 10 * 1000);
    });

    this.inMemoryDatabaseProvider = redisClient;
  }
}

export { RedisInMemoryDatabaseProvider };
