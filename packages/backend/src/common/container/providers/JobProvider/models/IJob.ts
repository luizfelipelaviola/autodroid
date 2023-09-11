import { Job, DoneCallback } from 'bull'

import { IAddJobOptionsDTO, IQueue } from '../types/IAddJobOptions.dto'

interface IJob {
  key: string
  handle(job: Job, queue: IQueue, done: DoneCallback): Promise<void>
  options: IAddJobOptionsDTO
}

export type { IJob }
