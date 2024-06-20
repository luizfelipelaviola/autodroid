import { GraphQLFormattedError } from "graphql";
import {
  AuthorizationError as TypeGraphQLAuthorizationError,
  AuthenticationError as TypeGraphQLAuthenticationError,
  ArgumentValidationError as TypeGraphQLArgumentValidationError,
  NoExplicitTypeError as TypeGraphQLNoExplicitTypeError,
  WrongNullableListOptionError as TypeGraphQLWrongNullableListOptionError,
} from "type-graphql";
import {
  ApolloServerErrorCode,
  unwrapResolverError,
} from "@apollo/server/errors";
import { ApolloServerPlugin } from "@apollo/server";
import * as Sentry from "@sentry/node";
import util from "node:util";

// Error import
import { AppError } from "@shared/errors/AppError";

export const errorPlugin: ApolloServerPlugin = {
  async requestDidStart() {
    return {
      async willSendResponse({ response }) {
        if (
          response.body.kind === "single" &&
          "data" in response.body.singleResult
        )
          response.body.singleResult.data = null;

        if (
          response.body.kind === "incremental" &&
          "initialResult" in response.body &&
          "data" in response.body.initialResult
        )
          response.body.initialResult.data = null;
      },
    };
  },
};

export function errorHandler(
  formattedError: GraphQLFormattedError,
  dispatchedError: any,
): GraphQLFormattedError {
  const error = unwrapResolverError(dispatchedError) as any;

  if (
    error instanceof AppError ||
    error.prototype.name === AppError.prototype.name
  ) {
    return {
      ...formattedError,
      message: error.message || "Internal server error.",
      extensions: {
        code: error.key || ApolloServerErrorCode.INTERNAL_SERVER_ERROR,
        ...(!!error.debug && { isFatal: true }),
      },
    };
  }

  if (error.originalError instanceof TypeGraphQLAuthenticationError)
    return {
      ...formattedError,
      message: "Authentication error.",
      extensions: {
        code: "UNAUTHORIZED",
      },
    };

  if (error.originalError instanceof TypeGraphQLAuthorizationError)
    return {
      ...formattedError,
      message: "Authentication error.",
      extensions: {
        code: "FORBIDDEN",
      },
    };

  const validationErrors = [
    TypeGraphQLArgumentValidationError,
    TypeGraphQLNoExplicitTypeError,
    TypeGraphQLWrongNullableListOptionError,
  ];
  if (
    validationErrors.some(
      validationError => error.originalError instanceof validationError,
    )
  ) {
    return {
      ...formattedError,
      message: formattedError.message,
      extensions: {
        ...error.extensions,
        code: "GRAPHQL_VALIDATION_FAILED",
      },
    };
  }

  if (
    !!formattedError.extensions?.code &&
    formattedError.extensions.code !==
      ApolloServerErrorCode.INTERNAL_SERVER_ERROR &&
    Object.values(ApolloServerErrorCode).includes(
      formattedError.extensions.code as any,
    )
  )
    return formattedError;

  console.log(
    `❌ Application failure: `,
    util.inspect(error, false, null, true),
  );

  Sentry.captureException(error);

  return {
    ...formattedError,
    message: "Internal server error.",
    extensions: {
      code: ApolloServerErrorCode.INTERNAL_SERVER_ERROR,
    },
  };
}
