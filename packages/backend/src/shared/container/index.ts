/* eslint prettier/prettier: ["error", {"printWidth": 250 }] */
import "reflect-metadata";
import { container } from "tsyringe";

// Providers import
import { IDatabaseProvider } from "./providers/DatabaseProvider/models/IDatabase.provider";
import { DatabaseProvider } from "./providers/DatabaseProvider";

import { INonRelationalDatabaseProvider } from "./providers/NonRelationalDatabaseProvider/models/INonRelationalDatabase.provider";
import { NonRelationalDatabaseProvider } from "./providers/NonRelationalDatabaseProvider";

import { IInMemoryDatabaseProvider } from "./providers/InMemoryDatabaseProvider/models/IInMemoryDatabase.provider";
import { InMemoryDatabaseProvider } from "./providers/InMemoryDatabaseProvider";

import { IUserAgentInfoProvider } from "./providers/UserAgentInfoProvider/models/IUserAgentInfo.provider";
import { UserAgentInfoProvider } from "./providers/UserAgentInfoProvider";

import { IAuthenticationProvider } from "./providers/AuthenticationProvider/models/IAuthentication.provider";
import { AuthenticationProvider } from "./providers/AuthenticationProvider";

// Repository import
import { initRepositories } from "./repositories";

const initContainer = async () => {
  /**
   * 1: Primary providers
   */
  container.registerSingleton<IDatabaseProvider>("DatabaseProvider", DatabaseProvider);
  container.registerSingleton<INonRelationalDatabaseProvider>("NonRelationalDatabaseProvider", NonRelationalDatabaseProvider);
  container.registerSingleton<IInMemoryDatabaseProvider>("InMemoryDatabaseProvider", InMemoryDatabaseProvider);

  /**
   * 2: Database repositories
   */
  await initRepositories();

  /**
   * 3: Secondary providers
   */
  container.registerSingleton<IUserAgentInfoProvider>("UserAgentInfoProvider", UserAgentInfoProvider);
  container.registerSingleton<IAuthenticationProvider>("AuthenticationProvider", AuthenticationProvider);

  /**
   * 4: Tertiary providers
   */

  /**
   * 5: Quaternary providers
   */
};

export { initContainer };
