declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // General
      APP_PORT: number
      NODE_ENV: string
      DEBUG: string

      // Cors
      CORS_ALLOWED_FROM: string

      // Database
      DATABASE_URL: string
      DATABASE_LOGGER_ENABLED: string

      // Redis
      REDIS_HOST: string
      REDIS_PORT: number
      REDIS_USER?: string
      REDIS_PASS?: string
      REDIS_DB?: number

      // Docker
      DOCKER_HOST: string
      DOCKER_PORT: number

      // Feature
      JOBS_ENABLED: string
      JOBS_CONCURRENCY: number
    }
  }
}

export {}
