import { inject, injectable } from "tsyringe";

// i18n import
import { i18n } from "@shared/i18n";

// Error import
import { AppError } from "@shared/errors/AppError";

// Entity import
import { User } from "@modules/user/entities/user.entity";

// Repository import
import { IUserRepository } from "@modules/user/repositories/IUser.repository";

// DTO import
import { ICreateUserDTO } from "../types/IUser.dto";

interface IRequest {
  data: ICreateUserDTO;
  language: string;
}

@injectable()
class CreateUserService {
  constructor(
    @inject("UserRepository")
    private userRepository: IUserRepository,
  ) {}

  public async execute({ data, language }: IRequest): Promise<User> {
    const t = await i18n(language);

    try {
      const user = await this.userRepository.create({
        ...data,
      });

      return user;
    } catch (error) {
      throw new AppError({
        key: "@create_user_service/FAIL_TO_CREATE_USER",
        message: t(
          "@create_user_service/FAIL_TO_CREATE_USER",
          "Fail to create user.",
        ),
        statusCode: 401,
      });
    }
  }
}

export { CreateUserService };
