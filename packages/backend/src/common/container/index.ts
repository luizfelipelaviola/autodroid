import { container } from 'tsyringe'

import { IDatabaseProvider } from './providers/DatabaseProvider/models/IDatabase.provider'
import { DatabaseProvider } from './providers/DatabaseProvider'

import { IInMemoryDatabaseProvider } from './providers/InMemoryDatabaseProvider/models/IInMemoryDatabase.provider'
import { InMemoryDatabaseProvider } from './providers/InMemoryDatabaseProvider'

import { IStorageProvider } from './providers/StorageProvider/models/IStorage.provider'
import { StorageProvider } from './providers/StorageProvider'

import { IDatasetProcessorProvider } from './providers/DatasetProcessorProvider/models/IDatasetProcessor.provider'
import { DatasetProcessorProvider } from './providers/DatasetProcessorProvider'

import { IJobProvider } from './providers/JobProvider/models/IJob.provider'
import { JobProvider } from './providers/JobProvider'

import {
  IUserRepository,
  PrismaUserRepository,
  IFileRepository,
  PrismaFileRepository,
  IDatasetRepository,
  PrismaDatasetRepository,
  IProcessingRepository,
  PrismaProcessingRepository,
} from './repositories'

container.registerSingleton<IDatabaseProvider>(
  'DatabaseProvider',
  DatabaseProvider,
)

container.registerSingleton<IInMemoryDatabaseProvider>(
  'InMemoryDatabaseProvider',
  InMemoryDatabaseProvider,
)

container.registerSingleton<IStorageProvider>(
  'StorageProvider',
  StorageProvider,
)

container.registerSingleton<IUserRepository>(
  'UserRepository',
  PrismaUserRepository,
)

container.registerSingleton<IFileRepository>(
  'FileRepository',
  PrismaFileRepository,
)

container.registerSingleton<IDatasetRepository>(
  'DatasetRepository',
  PrismaDatasetRepository,
)

container.registerSingleton<IProcessingRepository>(
  'ProcessingRepository',
  PrismaProcessingRepository,
)

container.registerSingleton<IDatasetProcessorProvider>(
  'DatasetProcessorProvider',
  DatasetProcessorProvider,
)

container.registerSingleton<IJobProvider>('JobProvider', JobProvider)
