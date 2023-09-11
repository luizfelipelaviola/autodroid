import { JobOptions, AdvancedSettings, Queue } from 'bull'
import { IJob } from '../models/IJob'

export type IAddJobOptionsDTO = JobOptions

export type IQueueOptionsDTO = AdvancedSettings

export interface IQueue {
  bull: Queue
  name: string
  handler: IJob
  options: IAddJobOptionsDTO
}
