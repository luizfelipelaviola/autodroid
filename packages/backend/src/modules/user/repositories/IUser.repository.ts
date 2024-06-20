// Constant import
import { UserSortingOptions } from "@modules/user/constants/userSortingOptions.constant";

// Entity import
import { User } from "@modules/user/entities/user.entity";

// DTO import
import { IPaginationDTO } from "@modules/pagination/types/IPagination.dto";
import { ISortingDTO } from "@modules/sorting/types/ISorting.dto";
import {
  ICreateUserDTO,
  IFindUserDTO,
  IUpdateUserDTO,
} from "../types/IUser.dto";

export interface IUserRepository {
  create(data: ICreateUserDTO): Promise<User>;

  findOne(filter: IFindUserDTO): Promise<User | null>;

  findMany(
    filter: IFindUserDTO,
    pagination: IPaginationDTO,
    sorting?: ISortingDTO<typeof UserSortingOptions>,
  ): Promise<User[]>;

  getCount(filter: IFindUserDTO): Promise<number>;

  updateOne(filter: IFindUserDTO, data: IUpdateUserDTO): Promise<User | null>;

  deleteOne(filter: IFindUserDTO): Promise<User | null>;
}
