import path from "node:path";
import { GraphQLSchema } from "graphql";
import { buildSchemaSync } from "type-graphql";
import { Server } from "node:http";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { ApolloServerPluginLandingPageDisabled } from "@apollo/server/plugin/disabled";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { RequestHandler } from "express";

// Configuration import
import { getEnvConfig } from "@config/env";

// Resolver import
import { resolvers } from "./resolvers";

// Helper import
import { GraphQLContext, contextHandler } from "./context";
import { authenticationHandler } from "./authentication";
import { errorHandler, errorPlugin } from "./error";
import { validationHandler } from "./validation";
import { ComplexityPlugin } from "./complexity";

class GraphQLApp {
  public readonly initialization: Promise<void>;

  public schema: GraphQLSchema;
  public server: ApolloServer<GraphQLContext>;
  public middleware: RequestHandler;

  constructor(httpServer: Server) {
    this.schema = buildSchemaSync({
      resolvers,
      emitSchemaFile: path.resolve(__dirname, "generated", "schema.gql"),
      authChecker: authenticationHandler,
      authMode: "error",
      validateFn: validationHandler,
    });

    this.server = new ApolloServer<GraphQLContext>({
      schema: this.schema,
      csrfPrevention: true,
      includeStacktraceInErrorResponses:
        process.env.NODE_ENV !== "production" && process.env.DEBUG === "true",
      formatError: errorHandler,
      cache: "bounded",
      introspection: true,
      plugins: [
        errorPlugin,
        ComplexityPlugin(this.schema),
        ...(getEnvConfig().NODE_ENV === "production"
          ? [ApolloServerPluginLandingPageDisabled()]
          : [
              ApolloServerPluginDrainHttpServer({ httpServer }),
              ApolloServerPluginLandingPageLocalDefault({ embed: true }),
            ]),
      ],
    });
    this.initialization = this.init();
  }

  private async init(): Promise<void> {
    await this.server.start();
    this.middleware = expressMiddleware(this.server, {
      context: contextHandler,
    });
  }
}

export { GraphQLApp };
