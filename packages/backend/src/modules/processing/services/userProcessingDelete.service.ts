import { inject, injectable } from 'tsyringe'

import { Processing } from '../entities/processing.entity'
import { AppError } from '@common/errors/AppError'
import { User } from '@modules/user/entities/user.entity'
import { IProcessingRepository } from '@common/container/repositories'
import { IStorageProvider } from '@common/container/providers/StorageProvider/models/IStorage.provider'

interface IRequest {
  processing_id: string
  user: User
}

@injectable()
class UserProcessingDeleteService {
  constructor(
    @inject('StorageProvider')
    private storageProvider: IStorageProvider,

    @inject('ProcessingRepository')
    private processingRepository: IProcessingRepository,
  ) {}

  public async execute({ processing_id }: IRequest): Promise<Processing> {
    const processing = await this.processingRepository.findOne({
      id: processing_id,
    })

    if (!processing)
      throw new AppError({
        key: '@processing_delete_service/PROCESSING_NOT_FOUND',
        message: 'Processing not found.',
        statusCode: 401,
      })

    await this.processingRepository.deleteOne({
      id: processing.id,
    })

    await this.storageProvider.removeDirectoryByDestination({
      destination: `${processing.destination}/${processing.id}`,
    })

    return processing
  }
}

export { UserProcessingDeleteService }
