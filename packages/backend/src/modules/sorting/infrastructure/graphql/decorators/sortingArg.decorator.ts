import { Arg } from "type-graphql";
import { GraphQLError } from "graphql";
import { ApolloServerErrorCode } from "@apollo/server/errors";

// Enum import
import { SORT_ORDER } from "@modules/sorting/types/sortOrder.enum";

// Schema import
import { SortingFieldSchema } from "@modules/sorting/schemas/sorting.schema";

const MAX_SORTING_ARGS = 3;

export function SortingArg<T>(
  fields: ReadonlyArray<keyof T>,
  { nullable = true }: { nullable?: boolean } = {},
) {
  return (target: any, key: string, descriptor: number) => {
    Arg("sorting", () => [SortingFieldSchema], {
      nullable,
      validateFn: (value?: any) => {
        if (nullable && !value) return;

        if (!value || !Array.isArray(value) || !value.length)
          throw new GraphQLError("Sorting fields not provided.", {
            extensions: {
              code: ApolloServerErrorCode.GRAPHQL_VALIDATION_FAILED,
            },
          });

        if (value.length > MAX_SORTING_ARGS)
          throw new GraphQLError(
            `Sorting fields must be less than or equal to ${MAX_SORTING_ARGS}.`,
            {
              extensions: {
                code: ApolloServerErrorCode.GRAPHQL_VALIDATION_FAILED,
              },
            },
          );

        const duplicatedFields = value.reduce<string[]>(
          (acc, item: SortingFieldSchema<string[]>, index) => {
            if (
              value.findIndex(
                compareItem => compareItem.field === item.field,
              ) !== index &&
              !acc.includes(item.field)
            ) {
              acc.push(item.field);
            }
            return acc;
          },
          [],
        );
        if (duplicatedFields.length)
          throw new GraphQLError(
            `Duplicated sorting fields: ${duplicatedFields.join(", ")}.`,
            {
              extensions: {
                code: ApolloServerErrorCode.GRAPHQL_VALIDATION_FAILED,
              },
            },
          );

        const validFields = fields.map(field => field.toString());
        const invalidFields = value.filter(
          field => !validFields.includes(field.field),
        );
        if (invalidFields.length) {
          throw new GraphQLError(
            `Invalid sorting fields: ${invalidFields
              .map(item => item.field)
              .join(", ")}. Valid fields are: ${validFields.join(", ")}.`,
            {
              extensions: {
                code: ApolloServerErrorCode.GRAPHQL_VALIDATION_FAILED,
              },
            },
          );
        }

        const invalidOrders = value.filter(
          field => !Object.values(SORT_ORDER).includes(field.order),
        );
        if (invalidOrders.length) {
          throw new GraphQLError(
            `Invalid sorting orders: ${invalidOrders
              .map(item => item.order)
              .join(", ")}. Valid orders are: ${Object.values(SORT_ORDER).join(
              ", ",
            )}.`,
            {
              extensions: {
                code: ApolloServerErrorCode.GRAPHQL_VALIDATION_FAILED,
              },
            },
          );
        }
      },
    })(target, key, descriptor);
  };
}
