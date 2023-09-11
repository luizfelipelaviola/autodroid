import { inject, injectable } from 'tsyringe'

import { IUserRepository } from '../repositories/IUser.repository'
import { User } from '../entities/user.entity'

@injectable()
class UserCreateService {
  constructor(
    @inject('UserRepository')
    private userRepository: IUserRepository,
  ) {}

  public async execute(): Promise<User> {
    const user = await this.userRepository.create()
    return user
  }
}

export { UserCreateService }
