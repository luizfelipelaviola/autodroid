import { container } from "tsyringe";

// Error import
import { AppError } from "@shared/errors/AppError";

// i18n import
import { i18n } from "@shared/i18n";

// Enum import
import { AUTH_PROVIDER } from "@shared/container/providers/AuthenticationProvider/types/authProvider.enum";

// Interface import
import {
  IAuthenticationMethod,
  IAuthenticationProvider,
} from "./models/IAuthentication.provider";

// Provider import
import * as AuthenticationProviders from "./implementations";

class AuthenticationProvider implements IAuthenticationProvider {
  public readonly default_auth_provider: AUTH_PROVIDER = AUTH_PROVIDER.FIREBASE;
  public readonly initialization: Promise<void>;
  private readonly providers: Record<AUTH_PROVIDER, IAuthenticationMethod>;

  constructor() {
    this.providers = {
      FIREBASE: container.resolve(
        AuthenticationProviders.FirebaseAuthenticationProvider,
      ),
    };
    this.initialization = this.init();
  }

  private async init(): Promise<void> {
    const promises = Object.values(this.providers).map(
      provider => provider.initialization,
    );
    await Promise.all([...promises]);
  }

  public async getProvider(
    code?: AUTH_PROVIDER,
    language = "en",
  ): Promise<IAuthenticationMethod> {
    const t = await i18n(language);

    const provider = this.providers[code || this.default_auth_provider];

    if (!provider) {
      throw new AppError({
        key: "@authentication_provider/INVALID_PROVIDER",
        message: t(
          "@authentication_provider/INVALID_PROVIDER",
          "Invalid authentication provider.",
        ),
        debug: {
          code,
          providers: this.providers,
        },
      });
    }

    await provider.initialization;

    return provider;
  }
}

export { AuthenticationProvider };
