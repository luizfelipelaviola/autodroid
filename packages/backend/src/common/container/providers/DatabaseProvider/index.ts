import { PrismaDatabaseProvider } from './implementations/prismaDatabase.provider'

const providers = {
  prisma: PrismaDatabaseProvider,
}

const DatabaseProvider = providers.prisma

export { DatabaseProvider }
