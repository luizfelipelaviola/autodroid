import { inject, injectable } from 'tsyringe'

import { IDatasetRepository } from '../repositories/IDataset.repository'
import { Dataset } from '../entities/dataset.entity'
import { AppError } from '@common/errors/AppError'
import { User } from '@modules/user/entities/user.entity'
import { IUpdateDatasetDTO } from '../types/IDataset.dto'

interface IRequest {
  dataset_id: string
  data: Omit<IUpdateDatasetDTO, 'user_id' | 'file_id'>
  user: User
}

@injectable()
class UserDatasetUpdateService {
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
        key: '@dataset_update_service/DATASET_NOT_FOUND',
        message: 'Dataset not found.',
        statusCode: 401,
      })

    return dataset
  }
}

export { UserDatasetUpdateService }
