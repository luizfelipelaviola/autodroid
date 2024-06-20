import { randomUUID } from "node:crypto";
import * as Sentry from "@sentry/node";
import util from "node:util";

// Configuration import
import { getEnvConfig } from "@config/env";

interface IAppError {
  key: string;
  message: string;
  statusCode?: number;
  debug?: {
    [key: string]: any;
    disableRegister?: boolean;
  };
}

class AppError extends Error {
  public readonly name: string;
  public readonly message: string;

  public readonly key: string;

  public readonly handler: string;
  public readonly errorCode: string;
  public readonly statusCode: number;

  public readonly debug:
    | {
        [key: string]: any;
      }
    | undefined;

  public readonly action: Promise<void>;

  constructor(params: IAppError) {
    super(params.message);
    Object.setPrototypeOf(this, AppError.prototype);

    if (Error.captureStackTrace) Error.captureStackTrace(this, AppError);

    this.name = params.key;
    this.message = params.message;

    this.key = params.key;

    this.handler = this.constructor.name;
    this.errorCode = randomUUID();
    this.statusCode = params.statusCode
      ? params.statusCode
      : params.debug
        ? 500
        : 400;

    this.debug = params.debug
      ? {
          ...params.debug,
          error_code: this.errorCode,
        }
      : undefined;
    this.action = this.register();
  }

  private async register() {
    if (
      (!!this.debug || this.statusCode >= 500) &&
      !this.debug?.disableRegister &&
      !getEnvConfig().isTestEnv
    ) {
      Sentry.addBreadcrumb({
        category: "data",
        message: this.message,
        data: this.debug,
        type: "error",
        level: "debug",
      });
      Sentry.captureException(this);

      if (getEnvConfig().DEBUG === "true")
        console.log(`❌ Error debug: `, util.inspect(this, false, null, true));
    }
  }

  static make(params: IAppError) {
    return new AppError(params);
  }
}

export { AppError };
