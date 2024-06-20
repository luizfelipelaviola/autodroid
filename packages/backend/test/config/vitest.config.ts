import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import swc from "unplugin-swc";

// eslint-disable-next-line import/no-default-export
export default defineConfig({
  test: {
    reporters: [
      "verbose",
      ["html", { outputFile: "test/outputs/reporters/html/index.html" }],
    ],
    coverage: {
      enabled: true,
      reportsDirectory: "test/outputs/coverage",
      reporter: ["json", "html"],
    },
    globals: false,
    workspace: "test/config/vitest.workspace.ts",
  },
  plugins: [swc.vite(), tsconfigPaths()],
});
