// Provider import
import { MongooseNonRelationalDatabaseProvider } from "./implementations/mongooseNonRelationalDatabase.provider";

const providers = {
  mongo: MongooseNonRelationalDatabaseProvider,
};

const NonRelationalDatabaseProvider = providers.mongo;

export { NonRelationalDatabaseProvider };
