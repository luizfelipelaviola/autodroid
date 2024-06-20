/* eslint-disable import/first */
import "reflect-metadata";
import dotenv from "dotenv";
import * as Mongoose from "mongoose";
import { afterEach, beforeEach } from "vitest";
import { randomUUID } from "node:crypto";
import { execSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";
import { Client } from "pg";
import { container } from "tsyringe";

dotenv.config({
  path: ".env.test",
});

// Container import
import { initRepositories } from "@shared/container/repositories";

// Provider import
import { PrismaDatabaseProvider } from "@shared/container/providers/DatabaseProvider/implementations/prismaDatabase.provider";
import { IDatabaseProvider } from "@shared/container/providers/DatabaseProvider/models/IDatabase.provider";
import { MongooseNonRelationalDatabaseProvider } from "@shared/container/providers/NonRelationalDatabaseProvider/implementations/mongooseNonRelationalDatabase.provider";
import { InMemoryDatabaseProvider } from "@shared/container/providers/InMemoryDatabaseProvider";
import { RedisInMemoryDatabaseProvider } from "@shared/container/providers/InMemoryDatabaseProvider/implementations/redisInMemoryDatabase.provider";
import { INonRelationalDatabaseProvider } from "@shared/container/providers/NonRelationalDatabaseProvider/models/INonRelationalDatabase.provider";
import { IInMemoryDatabaseProvider } from "@shared/container/providers/InMemoryDatabaseProvider/models/IInMemoryDatabase.provider";

// Util import
import { sleep } from "@shared/utils/sleep";

const initRelationalDatabase = async () => {
  const initialDatabaseUrl = process.env.DATABASE_URL;
  const url = new URL(initialDatabaseUrl!);
  url.searchParams.set("schema", `test-${randomUUID()}`);

  const databaseUrl = url.toString();
  process.env.DATABASE_URL = databaseUrl;

  execSync("./node_modules/.bin/prisma migrate deploy");

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });

  const databaseProvider = new PrismaDatabaseProvider(prisma);

  global.TestInjection.DatabaseProvider = databaseProvider;
  global.TestInjection.PrismaDatabaseProvider = prisma;

  container.registerInstance<IDatabaseProvider>(
    "DatabaseProvider",
    databaseProvider,
  );

  await databaseProvider.initialization;
};

const disposeRelationalDatabase = async () => {
  await global.TestInjection.PrismaDatabaseProvider?.$disconnect();

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();
  await client.query(
    `DROP SCHEMA IF EXISTS "${new URL(process.env.DATABASE_URL!).searchParams.get("schema")}" CASCADE`,
  );
  await client.end();
};

const initNonRelationalDatabase = async () => {
  const initialNonRelationalDatabaseUrl =
    process.env.NON_RELATIONAL_DATABASE_URL;
  const url = `${initialNonRelationalDatabaseUrl.split("/test")[0]}/test-${randomUUID()}`;

  process.env.NON_RELATIONAL_DATABASE_URL = url;

  const mongoose = Mongoose.createConnection();

  const nonRelationDatabaseProvider = new MongooseNonRelationalDatabaseProvider(
    mongoose,
  );

  global.TestInjection.NonRelationalDatabaseProvider =
    nonRelationDatabaseProvider;
  global.TestInjection.MongooseNonRelationalDatabaseProvider = mongoose;

  container.registerInstance<INonRelationalDatabaseProvider>(
    "NonRelationalDatabaseProvider",
    nonRelationDatabaseProvider,
  );

  await nonRelationDatabaseProvider.initialization;
};

const disposeNonRelationalDatabase = async () => {
  const { connection } = global.TestInjection.NonRelationalDatabaseProvider!;
  await connection.dropDatabase();
};

const initInMemoryDatabaseProvider = async () => {
  const redis = new RedisInMemoryDatabaseProvider(
    "default",
    defaultOptions => ({
      ...defaultOptions,
      keyPrefix: `test-${randomUUID()}`,
    }),
  );

  const inMemoryDatabaseProvider = new InMemoryDatabaseProvider(redis);

  global.TestInjection.InMemoryDatabaseProvider = inMemoryDatabaseProvider;
  global.TestInjection.RedisInMemoryDatabaseProvider = redis;

  container.registerInstance<IInMemoryDatabaseProvider>(
    "InMemoryDatabaseProvider",
    inMemoryDatabaseProvider,
  );

  await inMemoryDatabaseProvider.initialization;
};

const disposeInMemoryDatabaseProvider = async () => {
  const redis = global.TestInjection.RedisInMemoryDatabaseProvider;
  await redis?.provider.del("*");
};

beforeEach(async () => {
  global.TestInjection = global.TestInjection || {};
  await Promise.all([
    initRelationalDatabase(),
    initNonRelationalDatabase(),
    initInMemoryDatabaseProvider(),
  ]);

  await initRepositories();
});

afterEach(async () => {
  await sleep(1000);
  await Promise.all([
    disposeRelationalDatabase(),
    disposeNonRelationalDatabase(),
    disposeInMemoryDatabaseProvider(),
  ]);
});
