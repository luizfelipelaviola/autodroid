import { NextFunction, Request, Response } from "express";
import { container } from "tsyringe";

// Service import
import { HandleAuthenticationService } from "@modules/authentication/services/handleAuthentication.service";

const authenticationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { language, headers } = req;
  const { authorization: authHeader } = headers;

  if (authHeader) {
    // Get token instead of BEARER
    const [, access_token] = authHeader.split(" ");

    if (access_token) {
      try {
        const handleUserAuthenticationService = container.resolve(
          HandleAuthenticationService,
        );

        const session = await handleUserAuthenticationService.execute({
          access_token,
          language,
          agent_info: req.agent_info,
        });

        req.session = session;

        return next();
      } catch {}
    }
  }

  req.session = undefined as any;
  return next();
};

export { authenticationMiddleware };
