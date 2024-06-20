import dotenv from "dotenv";
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import {
  MongoDBContainer,
  StartedMongoDBContainer,
} from "@testcontainers/mongodb";
import { RedisContainer, StartedRedisContainer } from "@testcontainers/redis";

let teardownStarted = false;

let postgreSqlContainer: StartedPostgreSqlContainer | undefined;
let mongoDBContainer: StartedMongoDBContainer | undefined;
let redisContainer: StartedRedisContainer | undefined;

const startPostgreSql = async () => {
  const container = await new PostgreSqlContainer("postgres:14").start();
  process.env.DATABASE_URL = container.getConnectionUri().toString();
  postgreSqlContainer = container;
  return container;
};

const startMongoDb = async () => {
  const container = await new MongoDBContainer("mongo:6").start();
  process.env.NON_RELATIONAL_DATABASE_URL = container
    .getConnectionString()
    .toString();
  mongoDBContainer = container;
  return container;
};

const startRedis = async () => {
  const container = await new RedisContainer("redis:alpine").start();
  process.env.REDIS_HOST = container.getHost().toString();
  process.env.REDIS_PORT = container.getPort().toString();
  process.env.REDIS_USER = "";
  process.env.REDIS_PASS = "";
  process.env.REDIS_DB = "0";
  redisContainer = container;
  return container;
};

// eslint-disable-next-line import/no-default-export
export default async function setup() {
  dotenv.config({
    path: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
  });

  await Promise.all([startPostgreSql(), startMongoDb(), startRedis()]);

  return async () => {
    if (teardownStarted) throw new Error("Teardown called twice");
    teardownStarted = true;

    await Promise.all(
      [postgreSqlContainer, mongoDBContainer, redisContainer].map(
        async container => {
          await container?.stop();
        },
      ),
    );
  };
}
