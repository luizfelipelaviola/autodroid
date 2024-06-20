// Entity import
import { User } from "@modules/user/entities/user.entity";

export type ICreateUserDTO = Omit<
  User,
  // Base
  | "id"
  | "archived_at"
  | "created_at"
  | "updated_at"
  // Computed fields (calculated at entity level)
  | "is_admin"
  // Relations
  | "auth_provider_conns"
>;

export type IFindUserDTO = AtLeastOneProperty<{
  id?: string;
  email?: string;
  phone_number?: string;
}>;

export type IUpdateUserDTO = Partial<ICreateUserDTO>;
