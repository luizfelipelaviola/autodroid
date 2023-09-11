import { IAddJobOptionsDTO } from '../types/IAddJobOptions.dto'
import { IProcessDatasetJob } from '../jobs/processDatasetJob'

import * as Jobs from '../jobs'

type JobType<T = keyof typeof Jobs> = T extends 'ProcessDatasetJob'
  ? IProcessDatasetJob
  : never

export interface IJobProvider {
  readonly initialization: Promise<void>

  add<T extends keyof typeof Jobs>(
    name: T,
    data: JobType<T>,
    options?: IAddJobOptionsDTO,
  ): void

  close(): Promise<void>
}
