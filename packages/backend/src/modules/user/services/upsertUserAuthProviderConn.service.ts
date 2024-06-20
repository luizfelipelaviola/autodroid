import { inject, injectable } from "tsyringe";

// i18n import
import { TFunction } from "@shared/i18n";

// Error import
import { AppError } from "@shared/errors/AppError";

// Enum import
import { AUTH_PROVIDER } from "@shared/container/providers/AuthenticationProvider/types/authProvider.enum";

// Repository import
import { IUserAuthProviderConnRepository } from "@modules/user/repositories/IUserAuthProviderConn.repository";

// Entity import
import { UserAuthProviderConn } from "../entities/userAuthProviderConn.entity";

interface IRequest {
  code: string;
  user_id: string;
  auth_provider: AUTH_PROVIDER;
  payload: Record<string, any>;
  t: TFunction;
}

@injectable()
class UpsertUserAuthProviderConnService {
  constructor(
    @inject("UserAuthProviderConnRepository")
    private userAuthProviderConnRepository: IUserAuthProviderConnRepository,
  ) {}

  public async execute({
    user_id,
    auth_provider,
    payload,
    code,
    t,
  }: IRequest): Promise<UserAuthProviderConn> {
    let userAuthProviderConn =
      await this.userAuthProviderConnRepository.findOne({
        user_id,
        auth_provider,
        include_disconnected: true,
      });

    if (userAuthProviderConn)
      userAuthProviderConn =
        await this.userAuthProviderConnRepository.updateOne(
          {
            id: userAuthProviderConn.id,
          },
          {
            code,
            payload,
            disconnected_at: null,
          },
        );
    else
      userAuthProviderConn = await this.userAuthProviderConnRepository.create({
        user_id,
        auth_provider,
        payload,
        code,
      });

    if (!userAuthProviderConn)
      throw new AppError({
        key: "@user_auth_provider_conn_service/USER_AUTH_PROVIDER_CONN_NOT_FOUND",
        message: t(
          "@user_auth_provider_conn_service/USER_AUTH_PROVIDER_CONN_NOT_FOUND",
          "User auth provider conn not found.",
        ),
      });

    return userAuthProviderConn;
  }
}

export { UpsertUserAuthProviderConnService };
