import { inject, injectable } from "tsyringe";

// i18n import
import { i18n } from "@shared/i18n";

// Error import
import { AppError } from "@shared/errors/AppError";

// Provider import
import { IAuthenticationProvider } from "@shared/container/providers/AuthenticationProvider/models/IAuthentication.provider";

// Repository import
import { IUserAuthProviderConnRepository } from "@modules/user/repositories/IUserAuthProviderConn.repository";

// Entity import
import { User } from "../entities/user.entity";

interface IRequest {
  user: User;
  language: string;
}

@injectable()
class UserSessionsCloseService {
  constructor(
    @inject("AuthenticationProvider")
    private authenticationProvider: IAuthenticationProvider,

    @inject("UserAuthProviderConnRepository")
    private userAuthProviderConnRepository: IUserAuthProviderConnRepository,
  ) {}

  public async execute({ user, language }: IRequest): Promise<void> {
    const t = await i18n(language);

    const authenticationProvider =
      await this.authenticationProvider.getProvider(
        this.authenticationProvider.default_auth_provider,
      );

    const userAuthProviderConn =
      await this.userAuthProviderConnRepository.findOne({
        user_id: user.id,
        auth_provider: authenticationProvider.auth_provider,
      });

    if (!userAuthProviderConn)
      throw new AppError({
        key: "@user_session_close/NO_AUTH_PROVIDER_ACCOUNT_FOUND",
        message: t(
          "@user_session_close/NO_AUTH_PROVIDER_ACCOUNT_FOUND",
          "No connection found.",
        ),
      });

    await authenticationProvider.revokeTokens(userAuthProviderConn, language);
  }
}

export { UserSessionsCloseService };
