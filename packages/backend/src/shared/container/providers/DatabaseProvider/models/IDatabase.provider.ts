import { Prisma, PrismaClient } from "@prisma/client";

export interface IDatabaseProvider {
  readonly initialization: Promise<void>;

  client: PrismaClient;
}

export type { Prisma as DatabaseHelperTypes };
