// Util import
import { DefaultSortingOptions } from "@modules/sorting/utils/makeSortingObj";

// Entity import
import { User } from "../entities/user.entity";
import { UserAuthProviderConn } from "../entities/userAuthProviderConn.entity";

export const UserSortingOptions = [...DefaultSortingOptions] as const;

export type IUserSortingOptionsMap = EntitySortingOptionsMap<
  User,
  (typeof UserSortingOptions)[number]
>;

export const UserAuthProviderConnSortingOptions = [
  ...DefaultSortingOptions,
] as const;

export type UserAuthProviderConnSortingOptionsMap = EntitySortingOptionsMap<
  UserAuthProviderConn,
  (typeof UserAuthProviderConnSortingOptions)[number]
>;

export const UserPasswordChangeSortingOptions = [
  ...DefaultSortingOptions,
] as const;
