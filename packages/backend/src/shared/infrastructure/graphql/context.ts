import { i18n, TFunction } from "i18next";
import { Request, Response } from "express";
import { ExpressContextFunctionArgument } from "@apollo/server/express4";

// DTO import
import { IParsedUserAgentInfoDTO } from "@shared/container/providers/UserAgentInfoProvider/types/IParsedUserAgentInfo.dto";
import { Session } from "@modules/user/types/IUserSession.dto";

export type GraphQLContext = {
  // HTTP context
  req: Request;
  res: Response;

  // i18n context
  t: TFunction;
  i18n: i18n;
  language: string;
  languages: string[];

  // User agent information context
  agent_info?: IParsedUserAgentInfoDTO;

  // Session context
  session: Session;
};

export async function contextHandler({
  req,
  res,
}: ExpressContextFunctionArgument): Promise<GraphQLContext> {
  return {
    // HTTP context
    req,
    res,

    // i18n context
    t: req.t,
    i18n: req.i18n,
    language: req.language,
    languages: req.languages,

    // User agent information context
    agent_info: req.agent_info,

    // Session context
    session: req.session,
  };
}
