import { inject, injectable } from "tsyringe";

// Provider import
import {
  DatabaseHelperTypes,
  IDatabaseProvider,
} from "@shared/container/providers/DatabaseProvider/models/IDatabase.provider";

// Constant import
import { UserSortingOptions } from "@modules/user/constants/userSortingOptions.constant";

// Entity import
import { User } from "@modules/user/entities/user.entity";

// Util import
import { parse } from "@shared/utils/instanceParser";
import { makePaginationObj } from "@modules/pagination/utils/makePaginationObj";
import { makeSortingArr } from "@modules/sorting/utils/makeSortingArr";

// DTO import
import { IPaginationDTO } from "@modules/pagination/types/IPagination.dto";
import { ISortingDTO } from "@modules/sorting/types/ISorting.dto";
import {
  ICreateUserDTO,
  IFindUserDTO,
  IUpdateUserDTO,
} from "@modules/user/types/IUser.dto";

// Interface import
import { IUserRepository } from "@modules/user/repositories/IUser.repository";

@injectable()
class PrismaUserRepository implements IUserRepository {
  private readonly relations: DatabaseHelperTypes.UserInclude = {};

  constructor(
    @inject("DatabaseProvider")
    private databaseProvider: IDatabaseProvider,
  ) {}

  private getWhereClause(
    { id, email, phone_number }: IFindUserDTO,
    relations_enabled = true,
  ): DatabaseHelperTypes.UserWhereInput {
    return { id, email, phone_number };
  }

  public async create(data: ICreateUserDTO): Promise<User> {
    const user = await this.databaseProvider.client.user.create({
      data,
      include: this.relations,
    });

    return parse(User, user);
  }

  public async findOne(filter: IFindUserDTO): Promise<User | null> {
    return this.findMany(filter, { skip: 0, take: 1 }).then(
      result => result[0] || null,
    );
  }

  public async findMany(
    filter: IFindUserDTO,
    pagination: IPaginationDTO,
    sorting?: ISortingDTO<typeof UserSortingOptions>,
  ): Promise<User[]> {
    const users = await this.databaseProvider.client.user.findMany({
      where: this.getWhereClause(filter),

      include: this.relations,

      orderBy: makeSortingArr({
        options: UserSortingOptions,
        sorting,
      }),
      ...makePaginationObj(pagination),
    });

    return parse(User, users);
  }

  public async getCount(filter: IFindUserDTO): Promise<number> {
    return this.databaseProvider.client.user.count({
      where: this.getWhereClause(filter),
    });
  }

  public async updateOne(
    filter: IFindUserDTO,
    data: IUpdateUserDTO,
  ): Promise<User | null> {
    const record = await this.findOne(filter);
    if (!record) return null;

    const user = await this.databaseProvider.client.user.update({
      where: { id: record.id },
      data,
      include: this.relations,
    });

    return parse(User, user);
  }

  public async deleteOne(filter: IFindUserDTO): Promise<User | null> {
    const record = await this.findOne(filter);
    if (!record) return null;

    await this.databaseProvider.client.user.delete({
      where: { id: record.id },
      include: this.relations,
    });

    return record;
  }
}

export { PrismaUserRepository };
