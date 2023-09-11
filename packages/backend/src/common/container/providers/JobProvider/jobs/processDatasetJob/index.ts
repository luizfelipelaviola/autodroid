import { DoneCallback, Job } from 'bull'
import { inject, injectable } from 'tsyringe'

import { IJob } from '@common/container/providers/JobProvider/models/IJob'
import { IAddJobOptionsDTO, IQueue } from '../../types/IAddJobOptions.dto'
import { IDatasetProcessorProvider } from '@common/container/providers/DatasetProcessorProvider/models/IDatasetProcessor.provider'
import { PROCESSING_STATUS } from '@modules/processing/types/processingStatus.enum'
import { sleep } from '@common/util/sleep'

type IProcessDatasetJob = {
  processing_id: string
}

@injectable()
class ProcessDatasetJob implements IJob {
  public key = 'ProcessDatasetJob'
  public options: IAddJobOptionsDTO = {}

  constructor(
    @inject('DatasetProcessorProvider')
    private datasetProcessorProvider: IDatasetProcessorProvider,
  ) {}

  public async handle(
    job: Job<IProcessDatasetJob>,
    queue: IQueue,
    done: DoneCallback,
  ): Promise<void> {
    const { data } = job

    try {
      const processing = await this.datasetProcessorProvider.processDataset({
        processing_id: data.processing_id,
      })

      const shouldRetry = processing.retries < 3

      if (processing.status === PROCESSING_STATUS.SUCCEEDED) {
        done(null, `Processing ${processing.id} completed successfully.`)
      }

      if (processing.status === PROCESSING_STATUS.FAILED) {
        const message = `Processing ${processing.id} failed.`
        if (shouldRetry) job.moveToFailed(new Error(message), true)
        else done(new Error(message))
      }

      if (processing.status === PROCESSING_STATUS.PENDING) {
        const message = `Processing ${processing.id} stalled.`
        if (shouldRetry) job.moveToFailed(new Error(message), true)
        else done(new Error(message))
      }

      if (processing.status === PROCESSING_STATUS.PROCESSING) {
        await sleep(1000)
        await queue.bull.add(data, queue.options)
        await job.discard()
        done(new Error(`Processing ${processing.id} still processing.`))
      } else throw new Error()
    } catch (err) {
      done(new Error(`Processing ${data.processing_id} failed.`))
    }
  }
}

export type { IProcessDatasetJob }
export { ProcessDatasetJob }
