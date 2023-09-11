import { inject, injectable } from 'tsyringe'

import { IDatasetRepository } from '../repositories/IDataset.repository'
import { Dataset } from '../entities/dataset.entity'
import { AppError } from '@common/errors/AppError'
import { User } from '@modules/user/entities/user.entity'

interface IRequest {
  dataset_id: string
  user: User
}

@injectable()
class UserDatasetShowService {
  constructor(
    @inject('DatasetRepository')
    private datasetRepository: IDatasetRepository,
  ) {}

  public async execute({ dataset_id }: IRequest): Promise<Dataset> {
    const dataset = await this.datasetRepository.findOne({
      id: dataset_id,
    })

    if (!dataset)
      throw new AppError({
        key: '@dataset_show_service/DATASET_NOT_FOUND',
        message: 'Dataset not found.',
        statusCode: 401,
      })

    return dataset
  }
}

export { UserDatasetShowService }
