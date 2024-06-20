/* eslint-disable @typescript-eslint/no-namespace */

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // General
      APP_URL: string;
      APP_PORT: string;
      NODE_ENV: string;
      DEFAULT_LANGUAGE: string;
      TZ?: string;
      DEBUG: string;

      // Cors
      CORS_ALLOWED_FROM: string;

      // Database
      DATABASE_URL: string;
      DATABASE_LOGGER_ENABLED: string;

      // Non-relational database
      NON_RELATIONAL_DATABASE_URL: string;
      NON_RELATIONAL_DATABASE_LOGGER_ENABLED: string;

      // Redis
      REDIS_HOST: string;
      REDIS_PORT: string;
      REDIS_USER?: string;
      REDIS_PASS?: string;
      REDIS_DB?: string;

      // Providers
      FIREBASE_AUTHENTICATION_PROVIDER_PROJECT_ID: string;
      FIREBASE_AUTHENTICATION_PROVIDER_CLIENT_EMAIL: string;
      FIREBASE_AUTHENTICATION_PROVIDER_PRIVATE_KEY: string;

      // Feature
      SENTRY_DSN: string;

      JOBS_ENABLED: string;

      CRON_ENABLED: string;
      CRON_TIMEZONE: string;

      ADMIN_EMAILS: string;
    }
  }
}

export {};
