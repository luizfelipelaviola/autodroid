// Constant import
import { UserAuthProviderConnSortingOptions } from "@modules/user/constants/userSortingOptions.constant";

// Entity import
import { UserAuthProviderConn } from "@modules/user/entities/userAuthProviderConn.entity";

// DTO import
import { IPaginationDTO } from "@modules/pagination/types/IPagination.dto";
import { ISortingDTO } from "@modules/sorting/types/ISorting.dto";
import {
  ICreateUserAuthProviderConnDTO,
  IFindUserAuthProviderConnDTO,
  IUpdateUserAuthProviderConnDTO,
} from "../types/IUserAuthProviderConn.dto";

export interface IUserAuthProviderConnRepository {
  create(data: ICreateUserAuthProviderConnDTO): Promise<UserAuthProviderConn>;

  findOne(
    filter: IFindUserAuthProviderConnDTO,
  ): Promise<UserAuthProviderConn | null>;

  findMany(
    filter: IFindUserAuthProviderConnDTO,
    pagination: IPaginationDTO,
    sorting?: ISortingDTO<typeof UserAuthProviderConnSortingOptions>,
  ): Promise<UserAuthProviderConn[]>;

  getCount(filter: IFindUserAuthProviderConnDTO): Promise<number>;

  updateOne(
    filter: IFindUserAuthProviderConnDTO,
    data: IUpdateUserAuthProviderConnDTO,
  ): Promise<UserAuthProviderConn | null>;

  deleteOne(
    filter: IFindUserAuthProviderConnDTO,
  ): Promise<UserAuthProviderConn | null>;
}
