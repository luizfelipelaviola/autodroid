import 'express-async-errors'
import cors from 'cors'
import express, { type Express } from 'express'
import helmet from 'helmet'
import http, { type Server } from 'http'
import semver from 'semver'

import { envConfig } from '@common/config/env'
import { corsConfig } from '@common/config/cors'
import { errorMiddleware } from './middlewares/error.middleware'
import { router } from './routes'

class App {
  public readonly express: Express
  public readonly httpServer: Server

  constructor() {
    this.express = express()
    this.httpServer = http.createServer(this.express)
    this.express.set('trust proxy', 1)

    this.middlewares()
    this.routes()
    this.errorHandler()
    this.fallbackHandler()
  }

  private middlewares() {
    if (envConfig.NODE_ENV === 'production') this.express.use(helmet())
    this.express.use(cors(corsConfig))
    this.express.use(express.json())
    this.express.use(express.urlencoded({ extended: true }))
  }

  private routes() {
    this.express.use(router)
  }

  private errorHandler() {
    this.express.use(errorMiddleware)
  }

  private fallbackHandler() {
    this.express.use((req, res, _) => {
      return res.status(404).send()
    })
  }

  public async start() {
    this.httpServer.listen(envConfig.APP_PORT, () => {
      console.log(
        `⚡️ ${envConfig.APP_INFO.name || 'API'} ${
          envConfig.NODE_ENV
        } version ${semver.clean(
          envConfig.APP_INFO.version,
        )} using Node.js ${semver.clean(process.version)} running at port ${
          envConfig.APP_PORT
        } with PID ${process.pid}.`,
      )
    })
  }
}

export { App }
