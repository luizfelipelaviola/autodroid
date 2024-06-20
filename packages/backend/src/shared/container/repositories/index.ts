/* eslint prettier/prettier: ["error", {"printWidth": 250 }] */
import { container } from "tsyringe";

/* Document repositories */

/* Relational repositories */
import { IUserRepository } from "@modules/user/repositories/IUser.repository";
import { PrismaUserRepository } from "@modules/user/infrastructure/prisma/repositories/prismaUser.repository";

import { IUserAuthProviderConnRepository } from "@modules/user/repositories/IUserAuthProviderConn.repository";
import { PrismaUserAuthProviderConnRepository } from "@modules/user/infrastructure/prisma/repositories/prismaUserAuthProviderConn.repository";

const initRepositories = async () => {
  // MongoDB repositories

  // SQL repositories
  container.registerSingleton<IUserRepository>("UserRepository", PrismaUserRepository);
  container.registerSingleton<IUserAuthProviderConnRepository>("UserAuthProviderConnRepository", PrismaUserAuthProviderConnRepository);
};

export type {
  /* Document repositories */

  /* Relational repositories */
  IUserRepository,
  IUserAuthProviderConnRepository,
};

export { initRepositories };
