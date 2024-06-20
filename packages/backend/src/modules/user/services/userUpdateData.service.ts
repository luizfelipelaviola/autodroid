import { inject, injectable } from "tsyringe";
// i18n import
import { i18n } from "@shared/i18n";

// Error import
import { AppError } from "@shared/errors/AppError";

// Util import
import { isValidLanguage } from "@shared/utils/isValidLanguage";

// Provider import
import { IAuthenticationProvider } from "@shared/container/providers/AuthenticationProvider/models/IAuthentication.provider";

// Entity import
import { User } from "../entities/user.entity";

// Repository import
import { IUserRepository } from "../repositories/IUser.repository";
import { IUserAuthProviderConnRepository } from "../repositories/IUserAuthProviderConn.repository";
import { UserUpdateDataSchema } from "../schemas/userUpdateData.schema";

interface IRequest {
  user: User;

  data: UserUpdateDataSchema;

  language: string;
}

@injectable()
class UserUpdateDataService {
  constructor(
    @inject("UserRepository")
    private userRepository: IUserRepository,

    @inject("UserAuthProviderConnRepository")
    private userAuthProviderConnRepository: IUserAuthProviderConnRepository,

    @inject("AuthenticationProvider")
    private authenticationProvider: IAuthenticationProvider,
  ) {}

  public async execute({ user, data, language }: IRequest): Promise<User> {
    const t = await i18n(language);

    const authenticationProvider =
      await this.authenticationProvider.getProvider(
        this.authenticationProvider.default_auth_provider,
      );

    const authenticationProviderUser =
      await this.userAuthProviderConnRepository.findOne({
        user_id: user.id,
        auth_provider: authenticationProvider.auth_provider,
      });

    if (!authenticationProviderUser)
      throw new AppError({
        key: "@user_update_data_service/USER_REGISTRY_IN_AUTH_PROVIDER_NOT_FOUND",
        message: t(
          "@user_update_data_service/USER_REGISTRY_IN_AUTH_PROVIDER_NOT_FOUND",
          "User not found.",
        ),
        debug: {
          user,
          authenticationProviderUser,
        },
      });

    if (!isValidLanguage(language))
      throw new AppError({
        key: "@user_update_data_service/INVALID_LANGUAGE",
        message: t(
          "@user_update_data_service/INVALID_LANGUAGE",
          "Invalid language.",
        ),
      });

    await authenticationProvider.updateUserByCode(
      authenticationProviderUser.code,
      {
        name: data.name,
      },
      language,
    );

    const updatedUser = await this.userRepository.updateOne(
      { id: user.id },
      {
        name: data.name,
        phone_number: data.phone_number,
        language,
      },
    );

    if (!updatedUser)
      throw new AppError({
        key: "@user_update_data_service/USER_NOT_FOUND_AFTER_UPDATE",
        message: t(
          "@user_update_data_service/USER_NOT_FOUND_AFTER_UPDATE",
          "User not found.",
        ),
        debug: {
          user,
        },
      });

    return updatedUser;
  }
}

export { UserUpdateDataService };
