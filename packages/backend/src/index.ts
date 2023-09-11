import 'reflect-metadata'
import { container } from 'tsyringe'

import '@common/container'
import { App } from '@common/infra/http'

const main = async () => {
  try {
    const prerequisites = [
      'DatabaseProvider',
      'InMemoryDatabaseProvider',
      'StorageProvider',
      'DatasetProcessorProvider',
      'JobProvider',
    ]

    await prerequisites.reduce(async (promise, prerequisite) => {
      return promise.then(async () => {
        const dependency: any = container.resolve<any>(prerequisite)
        await dependency.initialization
        if (!dependency.initialization)
          throw new Error(`❌ ${prerequisite} initialization failed.`)
        return dependency.initialization
      })
    }, Promise.resolve())

    const app = new App()
    app.start()
  } catch (err: any) {
    console.log(`❌ Bootstrap failed. Shutting down. ${err?.message}`)
    console.log(`${err?.message}`)
    process.exit(1)
  }
}

main()
