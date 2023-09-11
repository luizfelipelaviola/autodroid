import { User } from '../entities/user.entity'
import { IFindUserDTO } from '../types/IUser.dto'

export interface IUserRepository {
  create(): Promise<User>
  findOne(filter: IFindUserDTO): Promise<User | null>
}
