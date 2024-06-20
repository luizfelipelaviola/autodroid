import { Arg, Authorized, Ctx, Mutation, Resolver } from "type-graphql";
import { container } from "tsyringe";

// Context import
import { GraphQLContext } from "@shared/infrastructure/graphql/context";

// Entity import
import { User } from "@modules/user/entities/user.entity";

// Service import
import { UserUpdateDataService } from "@modules/user/services/userUpdateData.service";

// Schema import
import { UserUpdateDataSchema } from "@modules/user/schemas/userUpdateData.schema";

@Resolver()
class UserUpdateDataResolver {
  @Authorized()
  @Mutation(() => User)
  async userUpdateData(
    @Arg("data")
    data: UserUpdateDataSchema,
    @Ctx() { session, language }: GraphQLContext,
  ): Promise<User> {
    const userUpdateDataService = container.resolve(UserUpdateDataService);

    const user = await userUpdateDataService.execute({
      user: session.user,
      data,
      language,
    });

    return user;
  }
}

export { UserUpdateDataResolver };
