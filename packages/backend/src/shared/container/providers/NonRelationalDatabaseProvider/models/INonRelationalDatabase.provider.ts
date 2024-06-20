import { Connection } from "mongoose";

export interface INonRelationalDatabaseProvider {
  readonly initialization: Promise<void>;

  connection: Connection;
}
