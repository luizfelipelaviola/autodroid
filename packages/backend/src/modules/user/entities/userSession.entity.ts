/* eslint-disable no-use-before-define */
import { Authorized, Directive, Field, ObjectType } from "type-graphql";
import { Type } from "class-transformer";

// Scalar import
import { JSONObject } from "@shared/types/json";

// Entity import
import { UserAuthProviderConn } from "./userAuthProviderConn.entity";

@ObjectType()
class UserSession {
  @Field()
  access_token: string;

  @Field()
  access_token_expires_at: Date;

  @Field(() => String, { nullable: true })
  refresh_token: string | null;

  @Field(() => Date, { nullable: true })
  refresh_token_expires_at: Date | null;

  @Authorized(["ADMIN"])
  @Directive("@auth(requires: ADMIN)")
  @Field(() => JSONObject)
  payload: Record<string, any>;

  /* Relations */

  @Field()
  user_auth_provider_conn_id: string;

  @Field(() => UserAuthProviderConn)
  @Type(() => UserAuthProviderConn)
  user_auth_provider_conn: UserAuthProviderConn;
}

export { UserSession };
