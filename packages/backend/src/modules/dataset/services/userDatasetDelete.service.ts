import { inject, injectable } from 'tsyringe'

import { IDatasetRepository } from '../repositories/IDataset.repository'
import { Dataset } from '../entities/dataset.entity'
import { AppError } from '@common/errors/AppError'
import { User } from '@modules/user/entities/user.entity'
import {
  IFileRepository,
  IProcessingRepository,
} from '@common/container/repositories'
import { IStorageProvider } from '@common/container/providers/StorageProvider/models/IStorage.provider'

interface IRequest {
  dataset_id: string
  user: User
}

@injectable()
class UserDatasetDeleteService {
  constructor(
    @inject('StorageProvider')
    private storageProvider: IStorageProvider,

    @inject('DatasetRepository')
    private datasetRepository: IDatasetRepository,

    @inject('FileRepository')
    private fileRepository: IFileRepository,

    @inject('ProcessingRepository')
    private processingRepository: IProcessingRepository,
  ) {}

  public async execute({ dataset_id }: IRequest): Promise<Dataset> {
    const dataset = await this.datasetRepository.findOne({
      id: dataset_id,
    })

    if (!dataset)
      throw new AppError({
        key: '@dataset_delete_service/DATASET_NOT_FOUND',
        message: 'Dataset not found.',
        statusCode: 401,
      })

    const processingExists = await this.processingRepository.findOne({
      dataset_id: dataset.id,
    })

    if (processingExists)
      throw new AppError({
        key: '@dataset_delete_service/DATASET_CONTAINS_PROCESSINGS',
        message: 'This dataset contains processing. Please delete it first.',
      })

    const file = await this.fileRepository.findOne({
      id: dataset.file.id,
    })

    if (!file)
      throw new AppError({
        key: '@dataset_delete_service/FILE_NOT_FOUND',
        message: 'File not found.',
        statusCode: 401,
      })

    await this.datasetRepository.deleteOne({
      id: dataset.id,
    })

    await this.fileRepository.deleteOne({
      id: file.id,
    })

    await this.storageProvider.removeFileByName({
      destination: file.destination,
      filename: file.filename,
    })

    return dataset
  }
}

export { UserDatasetDeleteService }
