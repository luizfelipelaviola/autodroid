import { defaultExclude, defineWorkspace } from "vitest/config";

// eslint-disable-next-line import/no-default-export
export default defineWorkspace([
  {
    extends: "./vitest.config.ts",
    test: {
      name: "integration",
      include: ["**/*.test.ts"],
      exclude: [...defaultExclude, "**/*.spec.ts"],
      globalSetup: ["test/config/integration/globalSetup.ts"],
      setupFiles: ["test/config/integration/setup.ts"],
    },
  },
  {
    extends: "./vitest.config.ts",
    test: {
      name: "unit",
      include: ["**/*.spec.ts"],
      exclude: [...defaultExclude, "**/*.test.ts"],
      setupFiles: ["test/config/unit/setup.ts"],
    },
  },
]);
