import { inject, injectable } from 'tsyringe'

import { Dataset } from '@modules/dataset/entities/dataset.entity'
import { IDatabaseProvider } from '@common/container/providers/DatabaseProvider/models/IDatabase.provider'
import {
  ICreateDatasetDTO,
  IFindDatasetDTO,
  IUpdateDatasetDTO,
} from '@modules/dataset/types/IDataset.dto'
import { IDatasetRepository } from '@modules/dataset/repositories/IDataset.repository'
import { parse } from '@common/util/instanceParser'

@injectable()
class PrismaDatasetRepository implements IDatasetRepository {
  private readonly relations = {
    user: true,
    file: true,
  }

  constructor(
    @inject('DatabaseProvider')
    private databaseProvider: IDatabaseProvider,
  ) {}

  public async create(data: ICreateDatasetDTO): Promise<Dataset> {
    const dataset = await this.databaseProvider.client.dataset.create({
      data,
      include: this.relations,
    })

    return parse(Dataset, dataset)
  }

  public async findOne(filter: IFindDatasetDTO): Promise<Dataset | null> {
    return this.findMany(filter).then((result) => result[0] || null)
  }

  public async findMany({ id, user_id }: IFindDatasetDTO): Promise<Dataset[]> {
    const datasets = await this.databaseProvider.client.dataset.findMany({
      where: {
        id,
        user_id,
      },
      include: this.relations,
    })

    return parse(Dataset, datasets)
  }

  public async updateOne(
    filter: IFindDatasetDTO,
    data: IUpdateDatasetDTO,
  ): Promise<Dataset | null> {
    const record = await this.findOne(filter)
    if (!record) return null

    const dataset = await this.databaseProvider.client.dataset.update({
      where: { id: record.id },
      data,
      include: this.relations,
    })

    return parse(Dataset, dataset)
  }

  public async deleteOne(filter: IFindDatasetDTO): Promise<Dataset | null> {
    const record = await this.findOne(filter)
    if (!record) return null

    const dataset = await this.databaseProvider.client.dataset.delete({
      where: { id: record.id },
      include: this.relations,
    })

    return parse(Dataset, dataset)
  }
}

export { PrismaDatasetRepository }
