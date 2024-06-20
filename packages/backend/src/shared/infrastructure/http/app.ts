/* eslint-disable no-console */
import express, { Express } from "express";
import "express-async-errors";
import * as Sentry from "@sentry/node";
import cors from "cors";
import useragent from "express-useragent";
import helmet from "helmet";
import http, { Server } from "node:http";
import * as i18nextMiddleware from "i18next-http-middleware";
import cookieParser from "cookie-parser";

// i18n import
import { i18next } from "@shared/i18n";

// Configuration import
import { getEnvConfig } from "@config/env";
import { getCorsConfig } from "@config/cors";
import { getSentryConfig } from "@config/sentry";

// Middleware import
import { authenticationMiddleware } from "@modules/authentication/infrastructure/http/middlewares/authentication.middleware";
import { userAgentMiddleware } from "./middlewares/userAgent.middleware";
import { lightRateLimiterMiddleware } from "./middlewares/lightRateLimiter.middleware";
import { errorMiddleware } from "./middlewares/error.middleware";

// Route import
import { router } from "./routes";

// App import
import { GraphQLApp } from "../graphql";
import { WebsocketApp } from "../websocket";

class App {
  public readonly express: Express;
  public readonly httpServer: Server;
  public readonly graphqlServer: GraphQLApp;
  public readonly websocketServer: WebsocketApp;

  constructor() {
    this.express = express();
    this.httpServer = http.createServer(this.express);
    this.graphqlServer = new GraphQLApp(this.httpServer);
    this.websocketServer = new WebsocketApp(this.httpServer);
    this.express.set("trust proxy", 1);

    Sentry.init(getSentryConfig());

    this.middlewares();
    this.routes();
    this.gql();
    this.fallbackHandler();
    this.errorHandler();
  }

  private middlewares() {
    if (getEnvConfig().NODE_ENV === "production") this.express.use(helmet());
    this.express.use(cors(getCorsConfig));
    this.express.use(cookieParser());
    this.express.use(express.json());

    this.express.use(lightRateLimiterMiddleware);

    this.express.use(i18nextMiddleware.handle(i18next));
    this.express.use(useragent.express());

    this.express.use(userAgentMiddleware);
    this.express.use(authenticationMiddleware);
  }

  private routes() {
    this.express.use(router);
  }

  private async gql() {
    await this.graphqlServer.initialization;
    this.express.use(this.graphqlServer.middleware);
  }

  private errorHandler() {
    Sentry.setupExpressErrorHandler(this.express);
    this.express.use(errorMiddleware);
  }

  private fallbackHandler() {
    this.express.use((req, res, next) => {
      if (req.path.startsWith("/graphql")) return next();
      return res.status(404).send();
    });
  }
}
const app = new App();
export { App, app };
