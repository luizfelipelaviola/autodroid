import { PrismaClient } from "@prisma/client";
import * as Mongoose from "mongoose";

// Provider import
import { IDatabaseProvider } from "@shared/container/providers/DatabaseProvider/models/IDatabase.provider";
import { INonRelationalDatabaseProvider } from "@shared/container/providers/NonRelationalDatabaseProvider/models/INonRelationalDatabase.provider";
import { IInMemoryDatabaseProvider } from "@shared/container/providers/InMemoryDatabaseProvider/models/IInMemoryDatabase.provider";
import { RedisInMemoryDatabaseProvider } from "@shared/container/providers/InMemoryDatabaseProvider/implementations/redisInMemoryDatabase.provider";

declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var TestInjection: {
    DatabaseProvider?: IDatabaseProvider;
    PrismaDatabaseProvider?: PrismaClient;

    NonRelationalDatabaseProvider?: INonRelationalDatabaseProvider;
    MongooseNonRelationalDatabaseProvider?: Mongoose.Connection;

    InMemoryDatabaseProvider?: IInMemoryDatabaseProvider;
    RedisInMemoryDatabaseProvider?: RedisInMemoryDatabaseProvider;
  };
}
