import { inject, injectable } from 'tsyringe'

import { IProcessingRepository } from '../repositories/IProcessing.repository'
import { Processing } from '../entities/processing.entity'
import { User } from '@modules/user/entities/user.entity'

interface IRequest {
  user: User
}

@injectable()
class UserProcessingIndexService {
  constructor(
    @inject('ProcessingRepository')
    private processingRepository: IProcessingRepository,
  ) {}

  public async execute(_: IRequest): Promise<Processing[]> {
    const processings = await this.processingRepository.findMany({})
    return processings
  }
}

export { UserProcessingIndexService }
