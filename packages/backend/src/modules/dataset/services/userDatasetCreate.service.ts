import { Request, Response } from 'express'
import { inject, injectable } from 'tsyringe'

import { IDatasetRepository } from '../repositories/IDataset.repository'
import { Dataset } from '../entities/dataset.entity'
import { AppError } from '@common/errors/AppError'
import { IStorageProvider } from '@common/container/providers/StorageProvider/models/IStorage.provider'
import { IFileRepository } from '@common/container/repositories'
import { IDatasetProcessorProvider } from '@common/container/providers/DatasetProcessorProvider/models/IDatasetProcessor.provider'

interface IRequest {
  request: Request
  response: Response
}

@injectable()
class UserDatasetCreateService {
  constructor(
    @inject('DatasetProcessorProvider')
    private datasetProcessorProvider: IDatasetProcessorProvider,

    @inject('StorageProvider')
    private storageProvider: IStorageProvider,

    @inject('DatasetRepository')
    private datasetRepository: IDatasetRepository,

    @inject('FileRepository')
    private fileRepository: IFileRepository,
  ) {}

  public async execute({ request, response }: IRequest): Promise<Dataset> {
    const upload = await this.storageProvider.uploadFiles({
      fields: {
        dataset: {
          allowedMimeTypes:
            this.datasetProcessorProvider.getAcceptedMimeTypes(),
          destination: 'storage/uploads/dataset',
          maxCount: 1,
          minCount: 1,
          maxSizeBytes: 500 * 1024 * 1024, // 500MB
        },
      },
      request,
      response,
    })

    try {
      if (upload.dataset?.length !== 1)
        throw new AppError({
          key: '@dataset_create_service/FILE_NOT_UPLOADED',
          message: 'File not uploaded.',
        })

      if (
        !request.body.description ||
        typeof request.body.description !== 'string'
      )
        throw new AppError({
          key: '@dataset_create_service/DESCRIPTION_NOT_PROVIDED',
          message: 'Description not provided.',
        })

      const file = await this.fileRepository.create(upload.dataset[0])

      const dataset = await this.datasetRepository.create({
        description: request.body.description,
        file_id: file.id,
        user_id: request.user.id,
      })

      return dataset
    } catch (err) {
      try {
        await Promise.all(
          Object.entries(upload).map(async ([, files]) => {
            await Promise.all(
              files.map(async (file) => {
                await this.storageProvider.removeFileByName({
                  destination: file.destination,
                  filename: file.filename,
                })
              }),
            )
          }),
        )
      } catch {}
      throw err
    }
  }
}

export { UserDatasetCreateService }
