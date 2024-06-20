import { container } from "tsyringe";

// Container import
import { initContainer } from "@shared/container/index";

const Bootstrap = (async () => {
  try {
    console.clear();

    await initContainer();

    // Bootstrap providers
    const prerequisites = [
      // Primary (NOTE: order is important | InMemoryDatabaseProvider is a keep-alive service)
      "DatabaseProvider",
      "NonRelationalDatabaseProvider",
      "InMemoryDatabaseProvider",

      // Secondary
      "UserAgentInfoProvider",
      "AuthenticationProvider",

      // Tertiary

      // Quaternary
    ];

    // Await prerequisites
    await prerequisites.reduce<Promise<any>>((promise, prerequisite) => {
      return promise.then(async () => {
        const dependency: any = container.resolve(prerequisite);
        await dependency.initialization;
        if (!dependency.initialization)
          throw new Error(`❌ ${prerequisite} initialization failed.`);
        return dependency.initialization;
      });
    }, Promise.resolve());

    // Sequence of bootstrapping
    // await condition;

    // Start app
    import("../http/server");
  } catch (err: any) {
    console.log(`❌ Bootstrap failed. Shutting down. ${err?.message}`);
    console.log(`${err?.message}`);
    process.exit(1);
  }
})();

export { Bootstrap };
