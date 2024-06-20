import { injectable } from "tsyringe";
import firebase from "firebase-admin";

// Configuration import
import { getFirebaseAuthProviderConfig } from "@config/firebase";

// Error import
import { AppError } from "@shared/errors/AppError";

// i18n import
import { i18n } from "@shared/i18n";

// Util import
import { executeAction } from "@shared/utils/executeAction";

// Enum import
import { AUTH_PROVIDER } from "@shared/container/providers/AuthenticationProvider/types/authProvider.enum";

// DTO import
import { UserAuthProviderConn } from "@modules/user/entities/userAuthProviderConn.entity";
import {
  IAuthenticationProviderVerifyTokenRequestDTO,
  IAuthenticationProviderSessionDTO,
  ICreateUserTokenByCodeDTO,
} from "../../types/IVerifyToken.dto";
import {
  IAuthenticationProviderUserDTO,
  ICreateAuthenticationProviderUserDTO,
  IUpdateAuthenticationProviderUserDTO,
} from "../../types/IAuthenticationProviderUser.dto";
import { IFirebaseAuthenticationProviderConfigurationDTO } from "./types/IFirebaseAuthenticationProvider.dto";

// Interface import
import { IAuthenticationMethod } from "../../models/IAuthentication.provider";

@injectable()
class FirebaseAuthenticationProvider implements IAuthenticationMethod {
  public readonly auth_provider = AUTH_PROVIDER.FIREBASE;
  public readonly initialization: Promise<void>;
  protected readonly configuration: IFirebaseAuthenticationProviderConfigurationDTO;

  private provider: firebase.app.App;

  constructor() {
    const firebaseAuthProviderConfig = getFirebaseAuthProviderConfig();
    this.configuration = {
      project_id: firebaseAuthProviderConfig.project_id,
      client_email: firebaseAuthProviderConfig.client_email,
      private_key: firebaseAuthProviderConfig.private_key,
    };
    this.initialization = executeAction({
      action: () => this.getProvider({ language: "en" }),
      actionName: "Firebase authentication provider init",
      retryDelay: 30 * 1000, // 30 seconds
      logging: true,
    });
  }

  private async getProvider(params: { language: string }): Promise<{
    provider: firebase.app.App;
  }> {
    if (!this.provider) {
      const { language } = params;

      const t = await i18n(language);

      if (
        !this.configuration.project_id ||
        !this.configuration.client_email ||
        !this.configuration.private_key
      )
        throw new AppError({
          key: "@firebase_authentication_provider_get_provider/INVALID_CONFIGURATION",
          message: t(
            "@firebase_authentication_provider_get_provider/INVALID_CONFIGURATION",
            "Invalid environment variables.",
          ),
        });

      try {
        firebase.initializeApp();
      } catch {}

      this.provider = firebase.initializeApp(
        {
          credential: firebase.credential.cert({
            projectId: this.configuration.project_id,
            clientEmail: this.configuration.client_email,
            privateKey: this.configuration.private_key,
          }),
        },
        `${this.auth_provider}_auth`,
      );
    }

    return {
      provider: this.provider,
    };
  }

  public async verifyAccessToken({
    access_token,
    language,
  }: IAuthenticationProviderVerifyTokenRequestDTO): Promise<IAuthenticationProviderSessionDTO> {
    const t = await i18n(language);

    const { provider } = await this.getProvider({ language });

    try {
      const response = await provider.auth().verifyIdToken(access_token, true);

      if (!response.uid)
        throw new AppError({
          key: "@firebase_authentication_provider_verify_access_token/INVALID_PROVIDER_RESPONSE",
          message: t(
            "@firebase_authentication_provider_verify_access_token/INVALID_PROVIDER_RESPONSE",
            "The authentication provider responded with invalid data.",
          ),
          statusCode: 504,
          debug: { response, access_token, provider },
        });

      return {
        access_token,
        access_token_expires_at: new Date(response.exp * 1000),
        refresh_token: undefined,
        refresh_token_expires_at: undefined,
        user_code: response.uid,
        auth_provider: this.auth_provider,
        parent_session: response.parent_session
          ? {
              auth_provider: response.parent_session.auth_provider,
              access_token: response.parent_session.access_token,
            }
          : undefined,
        payload: {
          ...(!!response.payload && { ...response.payload }),
        },
      };
    } catch (err) {
      if (err instanceof AppError) throw err;

      // Just 401 and let frontend refresh session because here we don't have the refresh token
      throw new AppError({
        key: "@firebase_authentication_provider_verify_access_token/INVALID_TOKEN",
        message: t(
          "@firebase_authentication_provider_verify_access_token/INVALID_TOKEN",
          "Invalid or expired token.",
        ),
        statusCode: 401,
      });
    }
  }

  public async createUser(
    params: ICreateAuthenticationProviderUserDTO,
    language: string,
  ): Promise<IAuthenticationProviderUserDTO> {
    const { name, email, email_verified, phone_number, photo_url, password } =
      params;

    const t = await i18n(language);

    const { provider } = await this.getProvider({ language });

    try {
      const emailAlreadyExists = await this.getUserByEmail(
        email,
        language,
      ).catch(() => null);
      const phoneNumberAlreadyExists = phone_number
        ? await this.getUserByPhoneNumber(phone_number, language).catch(
            () => null,
          )
        : null;
      const alreadyExists = emailAlreadyExists || phoneNumberAlreadyExists;

      if (alreadyExists)
        throw new AppError({
          key: "@firebase_authentication_provider_create_user/USER_ALREADY_EXISTS",
          message: t(
            "@firebase_authentication_provider_create_user/USER_ALREADY_EXISTS",
            "User already exists.",
          ),
          statusCode: 401,
        });

      const user = await provider.auth().createUser({
        displayName: name || undefined,
        email,
        emailVerified: !!email_verified,
        phoneNumber: phone_number || undefined,
        photoURL: photo_url || undefined,
        password: password || undefined,
      });

      if (!user.uid || !user.email)
        throw new AppError({
          key: "@firebase_authentication_provider_create_user/INVALID_PROVIDER_RESPONSE",
          message: t(
            "@firebase_authentication_provider_create_user/INVALID_PROVIDER_RESPONSE",
            "The authentication provider responded with invalid data.",
          ),
          statusCode: 504,
          debug: { params, user },
        });

      return {
        code: user.uid,
        name: user.displayName || "",
        email: user.email || "",
        phone_number: user.phoneNumber || "",
        photo_url: user.photoURL || "",
        payload: user,
        auth_provider: this.auth_provider,
      };
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError({
        key: "@firebase_authentication_provider_create_user/INVALID_RESPONSE",
        message: t(
          "@firebase_authentication_provider_create_user/INVALID_RESPONSE",
          "Fail to create user.",
        ),
        statusCode: 500,
        debug: { error: err, params, provider },
      });
    }
  }

  public async createUserTokenByCode({
    code,
    parent_session,
    payload,
    language,
  }: ICreateUserTokenByCodeDTO): Promise<string> {
    const t = await i18n(language);

    const { provider } = await this.getProvider({ language });

    const user = await this.getUserByCode(code, language);

    try {
      const token = await provider.auth().createCustomToken(user.code, {
        ...payload,
        parent_session,
      });
      return token;
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError({
        key: "@firebase_authentication_provider_create_user_session/ERROR",
        message: t(
          "@firebase_authentication_provider_create_user_session/ERROR",
          "Fail to create user session.",
        ),
        statusCode: 500,
      });
    }
  }

  public async getUserByAuthProviderSession(
    { access_token }: IAuthenticationProviderSessionDTO,
    language: string,
  ): Promise<IAuthenticationProviderUserDTO> {
    const session = await this.verifyAccessToken({ access_token, language });
    return this.getUserByCode(session.user_code, language);
  }

  public async getUserByCode(
    code: string,
    language: string,
  ): Promise<IAuthenticationProviderUserDTO> {
    const t = await i18n(language);

    const { provider } = await this.getProvider({ language });

    try {
      const user = await provider.auth().getUser(code);

      if (!user)
        throw new AppError({
          key: "@firebase_authentication_provider_get_user_by_code/USER_NOT_FOUND",
          message: t(
            "@firebase_authentication_provider_get_user_by_code/USER_NOT_FOUND",
            "User not found.",
          ),
          statusCode: 500,
          debug: { code, provider },
        });

      return {
        code: user.uid,
        name: user.displayName || "",
        email: user.email || "",
        phone_number: user.phoneNumber || "",
        photo_url: user.photoURL || "",
        password_hash: user.passwordHash || undefined,
        password_salt: user.passwordSalt || undefined,
        payload: user,
        auth_provider: this.auth_provider,
      };
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError({
        key: "@firebase_authentication_provider_get_user_by_code/CANNOT_GET",
        message: t(
          "@firebase_authentication_provider_get_user_by_code/CANNOT_GET",
          "Fail to get user information.",
        ),
        statusCode: 500,
        debug: { error: err, code, provider },
      });
    }
  }

  public async getUserByEmail(
    email: string,
    language: string,
  ): Promise<IAuthenticationProviderUserDTO> {
    const t = await i18n(language);

    const { provider } = await this.getProvider({ language });

    try {
      const user = await provider.auth().getUserByEmail(email);

      if (!user)
        throw new AppError({
          key: "@firebase_authentication_provider_get_user_by_email/USER_NOT_FOUND",
          message: t(
            "@firebase_authentication_provider_get_user_by_email/USER_NOT_FOUND",
            "User not found.",
          ),
          statusCode: 500,
        });

      return {
        code: user.uid,
        name: user.displayName || "",
        email: user.email || "",
        phone_number: user.phoneNumber || "",
        photo_url: user.photoURL || "",
        payload: user,
        auth_provider: this.auth_provider,
      };
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError({
        key: "@firebase_authentication_provider_get_user_by_email/CANNOT_GET",
        message: t(
          "@firebase_authentication_provider_get_user_by_email/CANNOT_GET",
          "Fail to get user information.",
        ),
      });
    }
  }

  public async getUserByPhoneNumber(
    phone_number: string,
    language: string,
  ): Promise<IAuthenticationProviderUserDTO> {
    const t = await i18n(language);

    const { provider } = await this.getProvider({ language });

    try {
      const user = await provider.auth().getUserByPhoneNumber(phone_number);

      if (!user)
        throw new AppError({
          key: "@firebase_authentication_provider_get_user_by_phone_number/USER_NOT_FOUND",
          message: t(
            "@firebase_authentication_provider_get_user_by_phone_number/USER_NOT_FOUND",
            "User not found.",
          ),
          statusCode: 500,
        });

      return {
        code: user.uid,
        name: user.displayName || "",
        email: user.email || "",
        phone_number: user.phoneNumber || "",
        photo_url: user.photoURL || "",
        payload: user,
        auth_provider: this.auth_provider,
      };
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError({
        key: "@firebase_authentication_provider_get_user_by_phone_number/CANNOT_GET",
        message: t(
          "@firebase_authentication_provider_get_user_by_phone_number/CANNOT_GET",
          "Fail to get user information.",
        ),
      });
    }
  }

  public async updateUserByCode(
    code: string,
    data: IUpdateAuthenticationProviderUserDTO,
    language: string,
  ): Promise<IAuthenticationProviderUserDTO> {
    const t = await i18n(language);

    const { provider } = await this.getProvider({ language });

    try {
      const user = await this.getUserByCode(code, language);

      const updated_user = await provider.auth().updateUser(user.code, {
        displayName: data.name,
        email: data.email,
        phoneNumber: data.phone_number,
        photoURL: data.photo_url,
        emailVerified: data.email_verified,
        password: data.password,
      });

      return {
        code: updated_user.uid,
        name: updated_user.displayName || "",
        email: updated_user.email || "",
        phone_number: updated_user.phoneNumber || "",
        photo_url: updated_user.photoURL || "",
        payload: updated_user,
        auth_provider: this.auth_provider,
      };
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError({
        key: "@firebase_authentication_provider_update_user_by_code/CANNOT_UPDATE",
        message: t(
          "@firebase_authentication_provider_update_user_by_code/CANNOT_UPDATE",
          "Fail to update user information.",
        ),
        statusCode: 500,
        debug: { error: err, data, provider },
      });
    }
  }

  public async deleteUserByCode(code: string, language: string): Promise<void> {
    const t = await i18n(language);

    const { provider } = await this.getProvider({ language });

    try {
      const user = await this.getUserByCode(code, language);

      await provider.auth().deleteUser(user.code);
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError({
        key: "@firebase_authentication_provider_delete_user_by_code/CANNOT_DELETE",
        message: t(
          "@firebase_authentication_provider_delete_user_by_code/CANNOT_DELETE",
          "Fail to delete user.",
        ),
        statusCode: 500,
        debug: { error: err, code, provider },
      });
    }
  }

  public async revokeTokens(
    user_auth_provider_conn: UserAuthProviderConn,
    language: string,
  ): Promise<void> {
    const t = await i18n(language);

    const { provider } = await this.getProvider({ language });

    if (user_auth_provider_conn.auth_provider !== this.auth_provider)
      throw new AppError({
        key: "@firebase_authentication_provider_revoke_tokens/INVALID_PROVIDER",
        message: t(
          "@firebase_authentication_provider_revoke_tokens/INVALID_PROVIDER",
          "Invalid provider.",
        ),
        statusCode: 500,
        debug: {
          user_auth_provider_conn,
        },
      });

    await this.getUserByCode(user_auth_provider_conn.code, language);

    try {
      await provider.auth().revokeRefreshTokens(user_auth_provider_conn.code);
    } catch (err) {
      throw new AppError({
        key: "@firebase_authentication_provider_revoke_tokens/CANNOT_REVOKE",
        message: t(
          "@firebase_authentication_provider_revoke_tokens/CANNOT_REVOKE",
          "Fail to revoke tokens.",
        ),
        statusCode: 500,
        debug: {
          error: err,
          user_auth_provider_conn,
          provider,
        },
      });
    }
  }
}

export { FirebaseAuthenticationProvider };
