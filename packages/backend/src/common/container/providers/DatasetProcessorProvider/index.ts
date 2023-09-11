import { DockerDatasetProcessorProvider } from './implementations/dockerDatasetProcessorProvider'

const providers = {
  docker: DockerDatasetProcessorProvider,
}

const DatasetProcessorProvider = providers.docker

export { DatasetProcessorProvider }
