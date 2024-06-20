import semver from "semver";
import { container } from "tsyringe";

// Configuration import
import { getEnvConfig } from "@config/env";

// Provider import
import { IDatabaseProvider } from "@shared/container/providers/DatabaseProvider/models/IDatabase.provider";
import { IInMemoryDatabaseProvider } from "@shared/container/providers/InMemoryDatabaseProvider/models/IInMemoryDatabase.provider";

// Server import
import { app } from "./app";

const { httpServer: server } = app;

const init = async () => {
  await app.graphqlServer.initialization;

  app.httpServer.listen(getEnvConfig().APP_PORT, () => {
    console.log(
      `⚡️ ${getEnvConfig().APP_INFO.name || "API"} ${
        getEnvConfig().NODE_ENV
      } version ${semver.clean(
        getEnvConfig().APP_INFO.version,
      )} using Node.js ${semver.clean(process.version)} running at port ${
        getEnvConfig().APP_PORT
      } with PID ${process.pid}.`,
    );
  });
};

init();

const shutdownSignals = [
  "SIGHUP",
  "SIGINT",
  "SIGQUIT",
  "SIGILL",
  "SIGTRAP",
  "SIGABRT",
  "SIGBUS",
  "SIGFPE",
  "SIGSEGV",
  "SIGUSR2",
  "SIGTERM",
];

let shutdownInProgress = false;
const shutdownHandler = async (signal: string) => {
  if (shutdownInProgress) return;
  shutdownInProgress = true;

  console.info("⛔ Shutting down...");

  try {
    await new Promise<void>(resolve => {
      server.close(() => {
        resolve();
      });
    })
      .then(() => {
        console.info("💻 Server closed.");
      })
      .catch(() => null);

    await Promise.resolve(
      app.websocketServer.server.local.disconnectSockets(true),
    )
      .then(() => {
        console.info("📡 Websocket server closed.");
      })
      .catch(() => null);

    const databaseProvider =
      container.resolve<IDatabaseProvider>("DatabaseProvider");
    await databaseProvider.client
      .$disconnect()
      .then(() => {
        console.info("💾 Database connection closed.");
      })
      .catch(() => null);

    const inMemoryDatabaseProvider =
      container.resolve<IInMemoryDatabaseProvider>("InMemoryDatabaseProvider");
    await inMemoryDatabaseProvider.connection
      .quit()
      .then(() => {
        console.info("💿 Redis connection closed.");
      })
      .catch(() => null);

    console.info(`⛔ Got ${signal} - Shutdown complete. Exiting...`);
    process.exit(0);
  } catch (err: any) {
    console.error(`❌ Got ${signal} - Shutdown failed. ${err?.message}`);
    process.exit(1);
  }
};

shutdownSignals.forEach((signal: string) => {
  process.on(signal as any, shutdownHandler);
});

export { server };
