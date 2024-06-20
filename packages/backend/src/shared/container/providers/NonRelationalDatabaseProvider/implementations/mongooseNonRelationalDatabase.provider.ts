import * as Mongoose from "mongoose";

// Configuration import
import { getEnvConfig } from "@config/env";

// Util import
import { executeAction } from "@shared/utils/executeAction";

// Interface import
import { INonRelationalDatabaseProvider } from "../models/INonRelationalDatabase.provider";

const logEnabled =
  getEnvConfig().NON_RELATIONAL_DATABASE_LOGGER_ENABLED === "true";

class MongooseNonRelationalDatabaseProvider
  implements INonRelationalDatabaseProvider
{
  public readonly initialization: Promise<void>;

  public readonly connection: Mongoose.Connection;

  constructor(client: Mongoose.Connection = Mongoose.createConnection()) {
    const mongooseClient = client;

    if (logEnabled) {
      mongooseClient.on("error", error => {
        console.log(`❌ MongoDB: ${error}`);
      });

      mongooseClient.on("disconnected", () => {
        console.log("❌ MongoDB: disconnected from the database.");
      });
    }

    mongooseClient.plugin(schema => {
      // eslint-disable-next-line func-names
      schema.virtual("id").get(function () {
        // eslint-disable-next-line no-underscore-dangle
        return (this._id as any).toHexString();
      });

      schema.set("toJSON", {
        virtuals: true,
      });

      schema.set("toObject", {
        virtuals: true,
      });
    });

    this.connection = mongooseClient;
    this.initialization = executeAction({
      action: () =>
        this.connection.openUri(getEnvConfig().NON_RELATIONAL_DATABASE_URL, {
          ...(!!getEnvConfig().isTestEnv && {
            directConnection: true,
          }),
        }),
      actionName: "Non-relational Database connection",
      logging: true,
    });
  }
}

export { MongooseNonRelationalDatabaseProvider };
