import { inject, injectable } from "tsyringe";
import { isBefore } from "date-fns";

// i18n import
import { i18n } from "@shared/i18n";

// Error import
import { AppError } from "@shared/errors/AppError";

// Provider import
import { IAuthenticationProvider } from "@shared/container/providers/AuthenticationProvider/models/IAuthentication.provider";

// Enum import
import { AUTH_PROVIDER } from "@shared/container/providers/AuthenticationProvider/types/authProvider.enum";

// DTO import
import { Session } from "@modules/user/types/IUserSession.dto";
import { IParsedUserAgentInfoDTO } from "@shared/container/providers/UserAgentInfoProvider/types/IParsedUserAgentInfo.dto";

// Util import
import { parse } from "@shared/utils/instanceParser";

// Repository import
import { IUserAuthProviderConnRepository } from "@modules/user/repositories/IUserAuthProviderConn.repository";
import { IUserRepository } from "@modules/user/repositories/IUser.repository";
import { HandleUserSessionService } from "./handleUserSession.service";

interface IRequest {
  allow_existing_only?: boolean;
  access_token: string;
  auth_provider?: AUTH_PROVIDER;
  agent_info?: IParsedUserAgentInfoDTO;
  language: string;
}

@injectable()
class HandleAuthenticationService {
  constructor(
    @inject("AuthenticationProvider")
    private authenticationProvider: IAuthenticationProvider,

    @inject("UserAuthProviderConnRepository")
    private userAuthProviderConnRepository: IUserAuthProviderConnRepository,

    @inject("UserRepository")
    private userRepository: IUserRepository,
  ) {}

  public async execute({
    allow_existing_only,
    access_token,
    agent_info,
    auth_provider = this.authenticationProvider.default_auth_provider,
    language,
  }: IRequest): Promise<Session> {
    const t = await i18n(language);

    const authenticationProvider =
      await this.authenticationProvider.getProvider(auth_provider);

    const userAuthProviderSession =
      await authenticationProvider.verifyAccessToken({
        access_token,
        language,
      });

    if (isBefore(userAuthProviderSession.access_token_expires_at, new Date()))
      throw new AppError({
        key: "@handle_authentication_service/EXPIRED_TOKEN",
        message: t(
          "@handle_authentication_service/EXPIRED_TOKEN",
          "This session has expired.",
        ),
      });

    const handleUserSessionService = new HandleUserSessionService(
      this.userAuthProviderConnRepository,
      this.userRepository,
    );

    let parent_session: Session | undefined;

    if (userAuthProviderSession.parent_session) {
      if (
        !userAuthProviderSession.parent_session?.access_token ||
        !userAuthProviderSession.parent_session?.auth_provider
      )
        throw new AppError({
          key: "@handle_authentication_service/INVALID_PARENT_SESSION_REGISTRY",
          message: t(
            "@handle_authentication_service/INVALID_PARENT_SESSION_REGISTRY",
            "Your session has a problem. Please sign in again.",
          ),
          statusCode: 401,
        });

      try {
        parent_session = await this.execute({
          allow_existing_only,
          access_token: userAuthProviderSession.parent_session.access_token,
          language,
          auth_provider: userAuthProviderSession.parent_session.auth_provider,
          agent_info,
        });
      } catch (err: any) {
        throw new AppError({
          key: "@handle_authentication_service/PROCESS_PARENT_SESSION_FAILED",
          message: err.message,
          statusCode: 401,
        });
      }
    }

    const userSession = await handleUserSessionService.execute({
      allow_existing_only,
      parent_session,
      user_auth_provider_session: userAuthProviderSession,
      authenticationProvider,
      agent_info,
      language,
    });

    const { user } = userSession.user_auth_provider_conn;

    return parse(Session, {
      user,
      user_auth_provider_conn: userSession.user_auth_provider_conn,
      user_session: userSession,
      is_admin: user.is_admin,
    });
  }
}

export { HandleAuthenticationService };
