import { inject, injectable } from 'tsyringe'

import { IDatasetRepository } from '../repositories/IDataset.repository'
import { Dataset } from '../entities/dataset.entity'
import { User } from '@modules/user/entities/user.entity'

interface IRequest {
  user: User
}

@injectable()
class UserDatasetIndexService {
  constructor(
    @inject('DatasetRepository')
    private datasetRepository: IDatasetRepository,
  ) {}

  public async execute(_: IRequest): Promise<Dataset[]> {
    const datasets = await this.datasetRepository.findMany({})
    return datasets
  }
}

export { UserDatasetIndexService }
