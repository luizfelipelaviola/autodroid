import { inject, injectable } from 'tsyringe'

import { Processing } from '@modules/processing/entities/processing.entity'
import { IDatabaseProvider } from '@common/container/providers/DatabaseProvider/models/IDatabase.provider'
import {
  ICreateProcessingDTO,
  IFindProcessingDTO,
  IUpdateProcessingDTO,
} from '@modules/processing/types/IProcessing.dto'
import { IProcessingRepository } from '@modules/processing/repositories/IProcessing.repository'
import { parse } from '@common/util/instanceParser'

@injectable()
class PrismaProcessingRepository implements IProcessingRepository {
  private readonly relations = {
    dataset: {
      include: {
        file: true,
        user: true,
      },
    },
  }

  constructor(
    @inject('DatabaseProvider')
    private databaseProvider: IDatabaseProvider,
  ) {}

  public async create(data: ICreateProcessingDTO): Promise<Processing> {
    const processing = await this.databaseProvider.client.processing.create({
      data,
      include: this.relations,
    })

    return parse(Processing, processing)
  }

  public async findOne(filter: IFindProcessingDTO): Promise<Processing | null> {
    return this.findMany(filter).then((result) => result[0] || null)
  }

  public async findMany({
    id,
    dataset_id,
    user_id,
  }: IFindProcessingDTO): Promise<Processing[]> {
    const processings = await this.databaseProvider.client.processing.findMany({
      where: {
        id,
        dataset_id,
        ...(!!user_id && { dataset: { user_id } }),
      },
      include: this.relations,
    })

    return parse(Processing, processings)
  }

  public async updateOne(
    filter: IFindProcessingDTO,
    data: IUpdateProcessingDTO,
  ): Promise<Processing | null> {
    const record = await this.findOne(filter)
    if (!record) return null

    const processing = await this.databaseProvider.client.processing.update({
      where: { id: record.id },
      data,
      include: this.relations,
    })

    return parse(Processing, processing)
  }

  public async deleteOne(
    filter: IFindProcessingDTO,
  ): Promise<Processing | null> {
    const record = await this.findOne(filter)
    if (!record) return null

    const processing = await this.databaseProvider.client.processing.delete({
      where: { id: record.id },
      include: this.relations,
    })

    return parse(Processing, processing)
  }
}

export { PrismaProcessingRepository }
