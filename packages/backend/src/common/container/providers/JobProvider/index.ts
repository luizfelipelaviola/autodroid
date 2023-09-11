// Provider import
import { BullJobProvider } from './implementations/BullJob.provider'

const providers = {
  bull: BullJobProvider,
}

const JobProvider = providers.bull

export { JobProvider }
