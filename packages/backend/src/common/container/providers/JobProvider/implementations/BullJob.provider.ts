import Bull, { Job } from 'bull'
import { container, inject, injectable } from 'tsyringe'

import { envConfig } from '@common/config/env'
import { IJobProvider } from '../models/IJob.provider'
import { IJob } from '../models/IJob'
import {
  IAddJobOptionsDTO,
  IQueue,
  IQueueOptionsDTO,
} from '../types/IAddJobOptions.dto'
import {
  IInMemoryDatabaseProvider,
  InMemoryDatabaseProviderAdapter,
} from '../../InMemoryDatabaseProvider/models/IInMemoryDatabase.provider'

import * as Jobs from '../jobs'

const bullRedisOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
}

@injectable()
class BullJobProvider implements IJobProvider {
  public readonly initialization: Promise<void>

  private inMemoryDatabaseClient: InMemoryDatabaseProviderAdapter
  private inMemoryDatabaseSubscriber: InMemoryDatabaseProviderAdapter

  private queues: IQueue[]

  private defaultOptions: IAddJobOptionsDTO = {
    attempts: 10,
    backoff: {
      type: 'fixed',
      delay: 30 * 1000,
    },

    removeOnComplete: true,
    removeOnFail: true,
  }

  private queueOptions: IQueueOptionsDTO = {
    maxStalledCount: 0,
    lockDuration: 5 * 60 * 1000, // 5 minutes
  }

  constructor(
    @inject('InMemoryDatabaseProvider')
    private inMemoryDatabaseProvider: IInMemoryDatabaseProvider,
  ) {
    this.inMemoryDatabaseClient = new this.inMemoryDatabaseProvider.Adapter(
      'jobs_client',
      (defaultOptions) => ({
        ...defaultOptions,
        ...bullRedisOptions,
      }),
    )
    this.inMemoryDatabaseSubscriber = new this.inMemoryDatabaseProvider.Adapter(
      'jobs_subscriber',
      (defaultOptions) => ({
        ...defaultOptions,
        ...bullRedisOptions,
      }),
    )
    this.initialization = this.init()
  }

  private async init() {
    await this.start()

    if (envConfig.JOBS_ENABLED === 'true') {
      this.process()
      console.log(
        `🆗 Processing background jobs on ${envConfig.APP_INFO.name || 'API'}.`,
      )
    }
  }

  private async start() {
    await this.inMemoryDatabaseClient.initialization
    await this.inMemoryDatabaseSubscriber.initialization

    const jobInstances: IJob[] = Object.values(Jobs).map((job: any) => {
      return container.resolve(job)
    })

    this.queues = Object.values<IJob>(jobInstances).map(
      (job: IJob): IQueue => ({
        bull: new Bull(job.key, {
          settings: this.queueOptions,
          createClient: (type, redisOptions) => {
            switch (type) {
              case 'client':
                return this.inMemoryDatabaseClient.provider
              case 'subscriber':
                return this.inMemoryDatabaseSubscriber.provider
              default:
                return new this.inMemoryDatabaseProvider.Adapter(
                  `jobs_bclient_${job.key}`,
                  (defaultOptions) => ({
                    ...defaultOptions,
                    ...bullRedisOptions,
                    redisOptions,
                  }),
                ).provider
            }
          },
        }),
        name: job.key,
        handler: job,
        options: job.options,
      }),
    )
  }

  private async process() {
    return this.queues.forEach((queue) => {
      queue.bull.process(
        Number(envConfig.JOBS_CONCURRENCY || 1),
        async (job: Job, done) => {
          await queue.handler.handle(job, queue, done)
        },
      )

      queue.bull.on('error', (error) => {
        // An error ocurred.
        console.log(`❌ Job [${queue.name}] failed! Error: ${error.message}`)
      })

      queue.bull.on('waiting', (jobId) => {
        // A Job is waiting to be processed as soon as a worker is idling.
        console.log(`⏸  Job [${queue.name}] with id [${jobId}] waiting...`)
      })

      queue.bull.on('active', (job, _) => {
        // A job has started. You can use `jobPromise.cancel()`` to abort it.
        console.log(
          `⏩ Job [${queue.name}] with id [${job.id}] is now on process...`,
        )
      })

      queue.bull.on('stalled', (job) => {
        // A job has been marked as stalled. This is useful for debugging job
        // workers that crash or pause the event loop.
        console.log(`🆘 Job [${queue.name}] with id [${job.id}] is stalled!`)
      })

      queue.bull.on('progress', (job, progress) => {
        // A job's progress was updated!
        console.log(
          `🔂 Job [${queue.name}] with id [${job.id}] has updated his progress to ${progress}!`,
        )
      })

      queue.bull.on('completed', (job, result) => {
        // A job successfully completed with a `result`.
        console.log(
          `✅ Job [${queue.name}] with id [${job.id}] has been completed. ${
            result ? `Message: ${result}` : ''
          }`,
        )
      })

      queue.bull.on('failed', (job, err) => {
        // A job failed with reason `err`!
        console.log(
          `❌ Job [${queue.name}] with id [${job.id}] failed! ${
            err.message ? `Message: ${err.message}` : ''
          }`,
        )
      })

      queue.bull.on('paused', () => {
        // The queue has been paused.
        console.log(`⏸ Queue [${queue.name}] has been paused.`)
      })

      queue.bull.on('resumed', () => {
        // The queue has been resumed.
        console.log(`⏯ Queue [${queue.name}] has been resumed.`)
      })

      queue.bull.on('cleaned', () => {
        // Old jobs have been cleaned from the queue. `jobs` is an array of cleaned
        // jobs, and `type` is the type of jobs cleaned.
        console.log(`⏯ Queue [${queue.name}] jobs have been cleaned.`)
      })

      queue.bull.on('drained', () => {
        // Emitted every time the queue has processed all the waiting jobs (even if there can be some delayed jobs not yet processed)
        console.log(`⏸  Queue [${queue.name}] is now drained.`)
      })

      queue.bull.on('removed', (job) => {
        // A job successfully removed.
        console.log(
          `❎ Job [${queue.name}] with id [${job.id}] was successfully removed.`,
        )
      })
    })
  }

  public add<T>(name: string, data: T, options?: IAddJobOptionsDTO): void {
    const selectedQueue = this.queues.find((queue) => queue.name === name)
    if (selectedQueue)
      selectedQueue.bull.add(data, {
        ...(options || this.defaultOptions),
        ...selectedQueue.options,
      })
  }

  public async close(): Promise<void> {
    await Promise.all(this.queues.map((queue) => queue.bull.close()))
    await this.inMemoryDatabaseSubscriber.provider.quit()
    await this.inMemoryDatabaseClient.provider.quit()
  }
}

export { BullJobProvider }
