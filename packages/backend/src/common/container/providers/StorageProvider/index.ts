import { LocalServerDiskStorageProvider } from './implementations/localServerDisk/localServerDiskStorage.provider'

const providers = {
  local: LocalServerDiskStorageProvider,
}

const StorageProvider = providers.local

export { StorageProvider }
