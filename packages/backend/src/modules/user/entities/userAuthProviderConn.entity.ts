import { Authorized, Directive, Field, ID, ObjectType } from "type-graphql";
import { Exclude, Type } from "class-transformer";

// Type import
import { UserAuthProviderConnEntityType } from "@shared/types/models";

// Scalar import
import { JSONObject } from "@shared/types/json";

// Enum import
import { AUTH_PROVIDER } from "@shared/container/providers/AuthenticationProvider/types/authProvider.enum";

// Entity import
import { PaginationConnection } from "@modules/pagination/entities/paginationConnection.entity";
import { User } from "./user.entity";

@ObjectType()
class UserAuthProviderConn implements UserAuthProviderConnEntityType {
  @Field(() => ID)
  id: string;

  @Field(() => AUTH_PROVIDER)
  auth_provider: AUTH_PROVIDER;

  @Field()
  code: string;

  @Authorized(["ADMIN"])
  @Directive("@auth(requires: ADMIN)")
  @Field(() => JSONObject)
  payload: Record<string, any>;

  @Field(() => Date, { nullable: true })
  disconnected_at: Date | null;

  @Field()
  created_at: Date;

  @Field()
  updated_at: Date;

  /* Relations */

  @Field()
  user_id: string;

  @Exclude()
  @Type(() => User)
  user: User;
}

const PaginatedUserAuthProviderConn =
  PaginationConnection(UserAuthProviderConn);
export type PaginatedUserAuthProviderConn = InstanceType<
  typeof PaginatedUserAuthProviderConn
>;

export { UserAuthProviderConn, PaginatedUserAuthProviderConn };
