import APP_INFO from '@/package.json'
import dotenv from 'dotenv'

dotenv.config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
})

const envConfig: Record<string, any> = {
  ...process.env,

  APP_INFO,
}

export { envConfig }
