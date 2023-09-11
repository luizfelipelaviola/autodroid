import { inject, injectable } from 'tsyringe'

import { IProcessingRepository } from '../repositories/IProcessing.repository'
import { Processing } from '../entities/processing.entity'
import { AppError } from '@common/errors/AppError'
import { User } from '@modules/user/entities/user.entity'
import { IStorageProvider } from '@common/container/providers/StorageProvider/models/IStorage.provider'

interface IRequest {
  processing_id: string
  user: User
}

interface IResponse {
  processing: Processing
  files: string[]
}

@injectable()
class UserProcessingShowService {
  constructor(
    @inject('ProcessingRepository')
    private processingRepository: IProcessingRepository,

    @inject('StorageProvider')
    private storageProvider: IStorageProvider,
  ) {}

  public async execute({ processing_id }: IRequest): Promise<IResponse> {
    const processing = await this.processingRepository.findOne({
      id: processing_id,
    })

    if (!processing)
      throw new AppError({
        key: '@processing_show_service/PROCESSING_NOT_FOUND',
        message: 'Processing not found.',
        statusCode: 401,
      })

    const files = await this.storageProvider.listFilesByDestination({
      destination: `${processing.destination}/${processing.id}`,
    })

    return {
      processing,
      files,
    }
  }
}

export { UserProcessingShowService }
