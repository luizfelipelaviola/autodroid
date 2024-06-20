import { NextFunction, Request, Response } from "express";
import { Details } from "express-useragent";
import { container, inject, injectable } from "tsyringe";

// Provider import
import { IUserAgentInfoProvider } from "@shared/container/providers/UserAgentInfoProvider/models/IUserAgentInfo.provider";

@injectable()
class ProcessUserAgentInfo {
  constructor(
    @inject("UserAgentInfoProvider")
    private userAgentInfoProvider: IUserAgentInfoProvider,
  ) {}

  public async execute(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    if (req.useragent === undefined) return next();

    const {
      isMobile,
      isDesktop,

      browser,
      version,
      os,
      platform,
    }: Details = req.useragent;

    req.agent_info = await this.userAgentInfoProvider.lookup({
      isMobile,
      isDesktop,

      ip: Array.isArray(req.headers["X-Forwarded-For"])
        ? req.headers["X-Forwarded-For"][0]
        : req.headers["X-Forwarded-For"] || req.socket.remoteAddress || req.ip,
      browser: {
        name: browser,
        version,
      },
      origin: {
        host: req.get("host"),
        url: req.get("origin"),
      },
      os,
      platform,
    });

    return next();
  }
}

const userAgentMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const processUserAgentInfo = container.resolve(ProcessUserAgentInfo);
  return processUserAgentInfo.execute(req, res, next);
};

export { userAgentMiddleware };
