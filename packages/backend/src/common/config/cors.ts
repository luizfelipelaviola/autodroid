import { envConfig } from '@common/config/env'

const corsConfig = {
  origin:
    envConfig.NODE_ENV === 'production'
      ? envConfig.CORS_ALLOWED_FROM.split(',')
      : '*',
}

export { corsConfig }
