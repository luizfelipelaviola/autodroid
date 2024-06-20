import { AppError } from "@shared/errors/AppError";
import { ApolloServerPlugin } from "@apollo/server";
import { GraphQLSchema } from "graphql";
import {
  getComplexity,
  fieldExtensionsEstimator,
  simpleEstimator,
} from "graphql-query-complexity";

const MAX_COMPLEXITY = 125;

export const ComplexityPlugin = (
  schema: GraphQLSchema,
): ApolloServerPlugin => ({
  requestDidStart: async () => ({
    async didResolveOperation({ request, document }) {
      const complexity = getComplexity({
        schema,
        operationName: request.operationName,
        query: document,
        variables: request.variables,
        estimators: [
          fieldExtensionsEstimator(),
          simpleEstimator({ defaultComplexity: 1 }),
        ],
      });

      if (complexity > MAX_COMPLEXITY) {
        throw new AppError({
          key: "@graphql/TOO_COMPLEX_QUERY",
          message: `Query too complex! ${complexity} exceeded the maximum allowed complexity of ${MAX_COMPLEXITY}`,
        });
      }
    },
  }),
});
