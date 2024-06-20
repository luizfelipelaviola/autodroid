// Entity import
import { UserAuthProviderConn } from "@modules/user/entities/userAuthProviderConn.entity";

// Enum import
import { AUTH_PROVIDER } from "@shared/container/providers/AuthenticationProvider/types/authProvider.enum";

// DTO import
import {
  IAuthenticationProviderVerifyTokenRequestDTO,
  IAuthenticationProviderSessionDTO,
  ICreateUserTokenByCodeDTO,
} from "../types/IVerifyToken.dto";
import {
  IAuthenticationProviderUserDTO,
  ICreateAuthenticationProviderUserDTO,
  IUpdateAuthenticationProviderUserDTO,
} from "../types/IAuthenticationProviderUser.dto";

export interface IAuthenticationMethod {
  readonly auth_provider: AUTH_PROVIDER;
  readonly initialization: Promise<void>;

  // Authentication methods
  verifyAccessToken(
    params: IAuthenticationProviderVerifyTokenRequestDTO,
  ): Promise<IAuthenticationProviderSessionDTO>;

  // Token methods
  createUserTokenByCode(params: ICreateUserTokenByCodeDTO): Promise<string>;
  revokeTokens(
    user_auth_provider_conn: UserAuthProviderConn,
    language: string,
  ): Promise<void>;

  // Provider methods
  createUser(
    params: ICreateAuthenticationProviderUserDTO,
    language: string,
  ): Promise<IAuthenticationProviderUserDTO>;

  getUserByAuthProviderSession(
    auth_provider_session: IAuthenticationProviderSessionDTO,
    language: string,
  ): Promise<IAuthenticationProviderUserDTO>;
  getUserByCode(
    code: string,
    language: string,
  ): Promise<IAuthenticationProviderUserDTO>;
  getUserByEmail(
    email: string,
    language: string,
  ): Promise<IAuthenticationProviderUserDTO>;
  getUserByPhoneNumber(
    phone_number: string,
    language: string,
  ): Promise<IAuthenticationProviderUserDTO>;

  updateUserByCode(
    code: string,
    data: IUpdateAuthenticationProviderUserDTO,
    language: string,
  ): Promise<IAuthenticationProviderUserDTO>;

  deleteUserByCode(code: string, language: string): Promise<void>;
}

export interface IAuthenticationProvider {
  readonly default_auth_provider: AUTH_PROVIDER;
  readonly initialization: Promise<void>;

  getProvider(
    code: AUTH_PROVIDER,
    language?: string,
  ): Promise<IAuthenticationMethod>;
}
