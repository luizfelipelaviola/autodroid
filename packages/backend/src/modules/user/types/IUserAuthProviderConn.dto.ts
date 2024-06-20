// Entity import
import { UserAuthProviderConn } from "@modules/user/entities/userAuthProviderConn.entity";

export type ICreateUserAuthProviderConnDTO = Omit<
  UserAuthProviderConn,
  // Base
  | "id"
  | "disconnected_at"
  | "created_at"
  | "updated_at"
  // Relations
  | "user"
  | "sessions"
>;

export type IFindUserAuthProviderConnDTO = AtLeastOneProperty<{
  id?: string;
  code?: string;
  auth_provider?: string;
  user_id?: string;
  include_disconnected?: boolean;
}>;

export type IUpdateUserAuthProviderConnDTO = Partial<
  Omit<ICreateUserAuthProviderConnDTO, "auth_provider" | "user_id"> &
    Pick<UserAuthProviderConn, "disconnected_at">
>;
