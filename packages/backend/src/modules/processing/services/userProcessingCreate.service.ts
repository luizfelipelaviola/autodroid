import { inject, injectable } from 'tsyringe'

import { IProcessingRepository } from '../repositories/IProcessing.repository'
import { Processing } from '../entities/processing.entity'
import { IDatasetRepository } from '@common/container/repositories'
import { User } from '@modules/user/entities/user.entity'
import { AppError } from '@common/errors/AppError'
import { PROCESSING_STATUS } from '../types/processingStatus.enum'
import { IDatasetProcessorProvider } from '@common/container/providers/DatasetProcessorProvider/models/IDatasetProcessor.provider'
import { IJobProvider } from '@common/container/providers/JobProvider/models/IJob.provider'

interface IRequest {
  dataset_id: string
  processor: string
  params: Record<string, string>
  user: User
}

@injectable()
class UserProcessingCreateService {
  constructor(
    @inject('DatasetProcessorProvider')
    private datasetProcessorProvider: IDatasetProcessorProvider,

    @inject('JobProvider')
    private jobProvider: IJobProvider,

    @inject('ProcessingRepository')
    private processingRepository: IProcessingRepository,

    @inject('DatasetRepository')
    private datasetRepository: IDatasetRepository,
  ) {}

  public async execute({
    dataset_id,
    processor,
    params,
  }: IRequest): Promise<Processing> {
    const dataset = await this.datasetRepository.findOne({
      id: dataset_id,
    })

    if (!dataset)
      throw new AppError({
        key: '@processing_create_service/DATASET_NOT_FOUND',
        message: 'Dataset not found.',
        statusCode: 401,
      })

    await this.datasetProcessorProvider.validateProcessorParams({
      processor,
      params,
    })

    const allowedMimeTypes =
      this.datasetProcessorProvider.getAcceptedMimeTypes()

    if (!allowedMimeTypes.includes(dataset.file.mime_type))
      throw new AppError({
        key: '@processing_create_service/INVALID_DATASET_MIMETYPE',
        message: 'This processor does not accept this dataset file type.',
      })

    const processing = await this.processingRepository.create({
      dataset_id: dataset.id,
      processor,
      finished_at: null,
      started_at: null,
      params,
      payload: {},
      destination: 'storage/processing',
      retries: 0,
      status: PROCESSING_STATUS.PENDING,
      status_description: 'Processing requested and is now pending.',
    })

    this.jobProvider.add(
      'ProcessDatasetJob',
      {
        processing_id: processing.id,
      },
      {
        jobId: processing.id,
        attempts: 3,
        backoff: {
          type: 'fixed',
          delay: 1000,
        },
      },
    )

    return processing
  }
}

export { UserProcessingCreateService }
