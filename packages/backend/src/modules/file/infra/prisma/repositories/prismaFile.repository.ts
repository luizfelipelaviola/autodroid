import { inject, injectable } from 'tsyringe'

import { File } from '@modules/file/entities/file.entity'
import { IDatabaseProvider } from '@common/container/providers/DatabaseProvider/models/IDatabase.provider'
import { ICreateFileDTO, IFindFileDTO } from '@modules/file/types/IFile.dto'
import { IFileRepository } from '@modules/file/repositories/IFile.repository'
import { parse } from '@common/util/instanceParser'

@injectable()
class PrismaFileRepository implements IFileRepository {
  private readonly relations = {}

  constructor(
    @inject('DatabaseProvider')
    private databaseProvider: IDatabaseProvider,
  ) {}

  public async create(data: ICreateFileDTO): Promise<File> {
    const file = await this.databaseProvider.client.file.create({
      data,
      include: this.relations,
    })

    return parse(File, file)
  }

  public async findOne(filter: IFindFileDTO): Promise<File | null> {
    return this.findMany(filter).then((result) => result[0] || null)
  }

  public async findMany({ id }: IFindFileDTO): Promise<File[]> {
    const files = await this.databaseProvider.client.file.findMany({
      where: {
        id,
      },
      include: this.relations,
    })

    return parse(File, files)
  }

  public async deleteOne(filter: IFindFileDTO): Promise<File | null> {
    const record = await this.findOne(filter)
    if (!record) return null

    const file = await this.databaseProvider.client.file.delete({
      where: { id: record.id },
      include: this.relations,
    })

    return parse(File, file)
  }
}

export { PrismaFileRepository }
