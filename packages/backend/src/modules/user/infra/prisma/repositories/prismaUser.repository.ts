import { inject, injectable } from 'tsyringe'

import { User } from '@modules/user/entities/user.entity'
import { IDatabaseProvider } from '@common/container/providers/DatabaseProvider/models/IDatabase.provider'
import { IFindUserDTO } from '@modules/user/types/IUser.dto'
import { IUserRepository } from '@modules/user/repositories/IUser.repository'
import { parse } from '@common/util/instanceParser'

@injectable()
class PrismaUserRepository implements IUserRepository {
  constructor(
    @inject('DatabaseProvider')
    private databaseProvider: IDatabaseProvider,
  ) {}

  public async create(): Promise<User> {
    const user = await this.databaseProvider.client.user.create({
      data: {},
    })

    return parse(User, user)
  }

  public async findOne({ id }: IFindUserDTO): Promise<User | null> {
    const user = await this.databaseProvider.client.user.findFirst({
      where: { id },
    })

    return parse(User, user)
  }
}

export { PrismaUserRepository }
