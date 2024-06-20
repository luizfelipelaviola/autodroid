import { inject, injectable } from "tsyringe";

// i18n import
import { i18n } from "@shared/i18n";

// Error import
import { AppError } from "@shared/errors/AppError";

// Provider import
import { IAuthenticationMethod } from "@shared/container/providers/AuthenticationProvider/models/IAuthentication.provider";

// DTO import
import { IParsedUserAgentInfoDTO } from "@shared/container/providers/UserAgentInfoProvider/types/IParsedUserAgentInfo.dto";
import { IAuthenticationProviderSessionDTO } from "@shared/container/providers/AuthenticationProvider/types/IVerifyToken.dto";
import { Session } from "@modules/user/types/IUserSession.dto";

// Entity import
import { UserSession } from "@modules/user/entities/userSession.entity";

// Repository import
import { IUserAuthProviderConnRepository } from "@modules/user/repositories/IUserAuthProviderConn.repository";
import { IUserRepository } from "@modules/user/repositories/IUser.repository";

// Service import
import { CreateUserService } from "@modules/user/services/createUser.service";
import { UpsertUserAuthProviderConnService } from "@modules/user/services/upsertUserAuthProviderConn.service";

interface IRequest {
  allow_existing_only?: boolean;
  parent_session?: Session;
  user_auth_provider_session: IAuthenticationProviderSessionDTO;
  agent_info?: IParsedUserAgentInfoDTO;
  authenticationProvider: IAuthenticationMethod;
  language: string;
}

@injectable()
class HandleUserSessionService {
  constructor(
    @inject("UserAuthProviderConnRepository")
    private userAuthProviderConnRepository: IUserAuthProviderConnRepository,

    @inject("UserRepository")
    private userRepository: IUserRepository,
  ) {}

  public async execute(params: IRequest): Promise<UserSession> {
    const {
      allow_existing_only,
      user_auth_provider_session,
      agent_info,
      authenticationProvider,
      language,
    } = params;

    const t = await i18n(language);

    let userSession = {} as UserSession;

    try {
      let userAuthProviderConn =
        await this.userAuthProviderConnRepository.findOne({
          code: user_auth_provider_session.user_code,
          auth_provider: user_auth_provider_session.auth_provider,
        });

      if (!userAuthProviderConn) {
        if (allow_existing_only)
          throw new AppError({
            key: "@handle_user_session_service/USER_NOT_FOUND",
            message: t(
              "@handle_user_session_service/USER_NOT_FOUND",
              "User not found.",
            ),
            statusCode: 401,
          });

        const userData =
          await authenticationProvider.getUserByAuthProviderSession(
            user_auth_provider_session,
            language,
          );

        let user = await this.userRepository.findOne({
          email: userData.email,
        });

        if (!user) {
          try {
            const createUserService = new CreateUserService(
              this.userRepository,
            );

            user = await createUserService.execute({
              data: {
                email: userData.email,
                name: userData.name || null,
                phone_number: userData.phone_number || null,
                language,
              },
              language,
            });
          } catch (error) {
            throw new AppError({
              key: "@handle_user_session_service/USER_NOT_FOUND",
              message: t(
                "@handle_user_session_service/USER_NOT_FOUND",
                "User not found.",
              ),
              statusCode: 401,
            });
          }
        }

        const upsertUserAuthProviderConnService =
          new UpsertUserAuthProviderConnService(
            this.userAuthProviderConnRepository,
          );

        userAuthProviderConn = await upsertUserAuthProviderConnService.execute({
          user_id: user.id,
          auth_provider: user_auth_provider_session.auth_provider,
          payload: {
            hasPassword: !!userData.password_hash,
          },
          code: user_auth_provider_session.user_code,
          t,
        });
      }

      userSession = {
        user_auth_provider_conn_id: userAuthProviderConn.id,
        access_token: user_auth_provider_session.access_token,
        access_token_expires_at:
          user_auth_provider_session.access_token_expires_at,

        refresh_token: user_auth_provider_session.refresh_token || null,
        refresh_token_expires_at:
          user_auth_provider_session.refresh_token_expires_at || null,

        payload: {
          ...(!!user_auth_provider_session.payload && {
            ...user_auth_provider_session.payload,
          }),
          ...(!!agent_info &&
            typeof agent_info === "object" && {
              agent_info,
            }),
        },

        user_auth_provider_conn: userAuthProviderConn,
      };
    } catch (err) {
      if (err instanceof AppError) throw err;

      throw new AppError({
        key: "@handle_user_session_service/UNEXPECTED_ERROR",
        message: t(
          "@handle_user_session_service/UNEXPECTED_ERROR",
          "An unexpected error has occurred. Please try again later.",
        ),
        statusCode: 500,
        debug: {
          params,
          error: err,
        },
      });
    }

    if (
      !userSession?.user_auth_provider_conn?.id ||
      !userSession?.user_auth_provider_conn?.user?.id ||
      userSession?.user_auth_provider_conn?.disconnected_at
    )
      throw new AppError({
        key: "@handle_user_session_service/INVALID_SESSION_REGISTRY",
        message: t(
          "@handle_user_session_service/INVALID_SESSION_REGISTRY",
          "Your session has a problem. Please sign in again.",
        ),
        statusCode: 401,
      });

    return userSession;
  }
}

export { HandleUserSessionService };
