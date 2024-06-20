import { inject, injectable } from "tsyringe";

// Provider import
import {
  DatabaseHelperTypes,
  IDatabaseProvider,
} from "@shared/container/providers/DatabaseProvider/models/IDatabase.provider";

// Constant import
import { UserAuthProviderConnSortingOptions } from "@modules/user/constants/userSortingOptions.constant";

// Entity import
import { UserAuthProviderConn } from "@modules/user/entities/userAuthProviderConn.entity";

// Util import
import { parse } from "@shared/utils/instanceParser";
import { makePaginationObj } from "@modules/pagination/utils/makePaginationObj";
import { makeSortingArr } from "@modules/sorting/utils/makeSortingArr";

// DTO import
import { IPaginationDTO } from "@modules/pagination/types/IPagination.dto";
import { ISortingDTO } from "@modules/sorting/types/ISorting.dto";
import {
  ICreateUserAuthProviderConnDTO,
  IFindUserAuthProviderConnDTO,
  IUpdateUserAuthProviderConnDTO,
} from "@modules/user/types/IUserAuthProviderConn.dto";

// Interface import
import { IUserAuthProviderConnRepository } from "@modules/user/repositories/IUserAuthProviderConn.repository";

@injectable()
class PrismaUserAuthProviderConnRepository
  implements IUserAuthProviderConnRepository
{
  private readonly relations: DatabaseHelperTypes.UserAuthProviderConnInclude =
    {
      user: true,
    };

  constructor(
    @inject("DatabaseProvider")
    private databaseProvider: IDatabaseProvider,
  ) {}

  private getWhereClause(
    {
      id,
      auth_provider,
      code,
      user_id,
      include_disconnected,
    }: IFindUserAuthProviderConnDTO,
    relations_enabled = true,
  ): DatabaseHelperTypes.UserAuthProviderConnWhereInput {
    return {
      id,
      user_id,
      auth_provider,
      code,

      ...(!include_disconnected && {
        disconnected_at: null,
      }),
    };
  }

  public async create(
    data: ICreateUserAuthProviderConnDTO,
  ): Promise<UserAuthProviderConn> {
    const userAuthProviderConn =
      await this.databaseProvider.client.userAuthProviderConn.create({
        data,
      });

    return parse(UserAuthProviderConn, userAuthProviderConn);
  }

  public async findOne(
    filter: IFindUserAuthProviderConnDTO,
  ): Promise<UserAuthProviderConn | null> {
    return this.findMany(filter, { skip: 0, take: 1 }).then(
      result => result[0] || null,
    );
  }

  public async findMany(
    filter: IFindUserAuthProviderConnDTO,
    pagination: IPaginationDTO,
    sorting?: ISortingDTO<typeof UserAuthProviderConnSortingOptions>,
  ): Promise<UserAuthProviderConn[]> {
    const userAuthProviderConn =
      await this.databaseProvider.client.userAuthProviderConn.findMany({
        where: this.getWhereClause(filter),

        include: this.relations,

        orderBy: makeSortingArr({
          options: UserAuthProviderConnSortingOptions,
          sorting,
        }),
        ...makePaginationObj(pagination),
      });

    return parse(UserAuthProviderConn, userAuthProviderConn);
  }

  public async getCount(filter: IFindUserAuthProviderConnDTO): Promise<number> {
    return this.databaseProvider.client.userAuthProviderConn.count({
      where: this.getWhereClause(filter),
    });
  }

  public async updateOne(
    filter: IFindUserAuthProviderConnDTO,
    data: IUpdateUserAuthProviderConnDTO,
  ): Promise<UserAuthProviderConn | null> {
    const record = await this.findOne(filter);
    if (!record) return null;

    const userAuthProviderConn =
      await this.databaseProvider.client.userAuthProviderConn.update({
        where: { id: record.id },
        data,
        include: this.relations,
      });

    return parse(UserAuthProviderConn, userAuthProviderConn);
  }

  public async deleteOne(
    filter: IFindUserAuthProviderConnDTO,
  ): Promise<UserAuthProviderConn | null> {
    const record = await this.findOne(filter);
    if (!record) return null;

    await this.databaseProvider.client.userAuthProviderConn.update({
      where: { id: record.id },
      data: { disconnected_at: new Date() },
      include: this.relations,
    });

    return record;
  }
}

export { PrismaUserAuthProviderConnRepository };
