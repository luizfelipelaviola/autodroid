// Enum import
import { AUTH_PROVIDER } from "@shared/container/providers/AuthenticationProvider/types/authProvider.enum";

export interface IAuthenticationProviderUserDTO {
  code: string;
  email: string;
  name?: string | null;
  phone_number?: string | null;
  photo_url?: string;
  password_hash?: string;
  password_salt?: string;
  payload?: Record<string, any>;
  auth_provider: AUTH_PROVIDER;
}

export interface ICreateAuthenticationProviderUserDTO {
  name?: string | null;
  email: string;
  email_verified?: boolean;
  phone_number?: string | null;
  phone_number_verified?: boolean;
  photo_url?: string | null;
  password?: string;
  payload?: Record<string, any>;
}

export type IUpdateAuthenticationProviderUserDTO =
  Partial<ICreateAuthenticationProviderUserDTO>;
