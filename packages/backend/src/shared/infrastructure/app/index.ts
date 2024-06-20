import "reflect-metadata";
import dotenv from "dotenv";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import AppInfo from "@/package.json";

dotenv.config({
  path: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
});

const argv = yargs(hideBin(process.argv))
  .scriptName(AppInfo.name)
  .usage("$0 [args]")
  .option("env", {
    type: "string",
    default: "development",
    choices: ["development", "production", "staging", "none"],
    alias: "e",
    description: "Environment to run the app",
  })
  .help()
  .parseSync();

async function main() {
  import("./bootstrap");
}

main();

export { argv };
