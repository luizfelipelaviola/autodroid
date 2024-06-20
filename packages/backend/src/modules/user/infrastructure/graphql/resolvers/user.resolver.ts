import { Authorized, Ctx, Query, Resolver } from "type-graphql";

// Entity import
import { User } from "@modules/user/entities/user.entity";

// Context import
import { GraphQLContext } from "@shared/infrastructure/graphql/context";

// DTO import
import { Session } from "@modules/user/types/IUserSession.dto";

@Resolver()
class UserResolver {
  @Authorized()
  @Query(() => User)
  async user(@Ctx() ctx: GraphQLContext): Promise<User> {
    return ctx.session?.user;
  }

  @Authorized()
  @Query(() => Session)
  async session(@Ctx() ctx: GraphQLContext): Promise<Session> {
    return ctx.session;
  }
}

export { UserResolver };
