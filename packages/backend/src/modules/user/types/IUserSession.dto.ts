import { Field, ObjectType } from "type-graphql";

// Entity import
import { UserSession } from "@modules/user/entities/userSession.entity";
import { User } from "@modules/user/entities/user.entity";
import { UserAuthProviderConn } from "@modules/user/entities/userAuthProviderConn.entity";

export interface IUserSessionDTO {
  user: User;
  user_auth_provider_conn: UserAuthProviderConn;
  user_session: UserSession;

  is_admin: boolean;
}

@ObjectType()
export class Session implements IUserSessionDTO {
  @Field(() => User)
  user: User;

  @Field(() => UserAuthProviderConn)
  user_auth_provider_conn: UserAuthProviderConn;

  @Field(() => UserSession)
  user_session: UserSession;

  is_admin: boolean;
}
