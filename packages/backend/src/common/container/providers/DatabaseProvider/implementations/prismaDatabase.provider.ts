import { PrismaClient } from '@prisma/client'

import { envConfig } from '@common/config/env'
import { executeAction } from '@common/util/executeAction'
import { IDatabaseProvider } from '../models/IDatabase.provider'

const logEnabled = envConfig.DATABASE_LOGGER_ENABLED === 'true'

class PrismaDatabaseProvider implements IDatabaseProvider {
  public readonly initialization: Promise<void>

  private databaseProvider: PrismaClient
  public readonly client: PrismaClient

  constructor() {
    const prismaClient = new PrismaClient({
      log: logEnabled ? ['query', 'info', 'warn', 'error'] : [],
    })

    this.databaseProvider = prismaClient
    this.client = prismaClient
    this.initialization = executeAction({
      action: () => this.databaseProvider.$connect(),
      actionName: 'Database connection',
      logging: true,
    })
  }
}

export { PrismaDatabaseProvider }
