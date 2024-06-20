import * as Sentry from "@sentry/node";

// Error import
import { AppError } from "@shared/errors/AppError";

// Args import
import { argv } from "@shared/infrastructure/app";

// Configuration import
import { getEnvConfig } from "@config/env";

const getSentryConfig: () => Sentry.NodeOptions = () => ({
  dsn: getEnvConfig().SENTRY_DSN,
  environment: argv.env || process.env.NODE_ENV,
  release: getEnvConfig().APP_INFO.version,
  tracesSampleRate: 1.0,
  beforeSend(event: any) {
    if (
      (event.statusCode && Number(event.statusCode) >= 500) ||
      (event instanceof AppError && !!event.debug)
    )
      return event;
    return null;
  },
});

export { getSentryConfig };
