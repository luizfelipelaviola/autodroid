import { inject, injectable } from 'tsyringe'

import { IUserRepository } from '../repositories/IUser.repository'
import { User } from '../entities/user.entity'
import { AppError } from '@common/errors/AppError'

interface IRequest {
  user_id: string
}

@injectable()
class UserShowService {
  constructor(
    @inject('UserRepository')
    private userRepository: IUserRepository,
  ) {}

  public async execute({ user_id }: IRequest): Promise<User> {
    const user = await this.userRepository.findOne({ id: user_id })

    if (!user)
      throw new AppError({
        key: '@user_show_service/USER_NOT_FOUND',
        message: 'User not found.',
        statusCode: 401,
      })

    return user
  }
}

export { UserShowService }
