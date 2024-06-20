// DTO import
import { ISortingDTO } from "@modules/sorting/types/ISorting.dto";
import { AppError } from "@shared/errors/AppError";
import { isValidSortingField } from "../isValidSortingField";

export type SortingOrder = "asc" | "desc";

export type ISortingObj<T extends readonly string[]> = {
  [key in T[number]]?: SortingOrder;
};

export type ISortingOverrides<T extends readonly string[]> = {
  [key in T[number]]?: any;
};

export type IMakeSortingParams<T extends readonly string[]> = {
  options: T;
  sorting?: ISortingDTO<T>;
  fallback?: ISortingObj<T>;
  common?: ISortingObj<T>;
  overrides?: ISortingOverrides<T>;
};

export const DefaultSortingOptions = [
  "created_at",
  "updated_at",
  "id",
] as const;
export const DefaultSortingSetting: ISortingObj<typeof DefaultSortingOptions> =
  {
    // WARNING: order matters
    created_at: "desc",
    id: "desc",
  };

export const makeSortingObj = <T extends readonly string[]>(
  params: IMakeSortingParams<T>,
): ISortingObj<T> => {
  const {
    options = DefaultSortingOptions,
    sorting,

    fallback,
    common = DefaultSortingSetting,

    overrides,
  } = params;

  let orderBy =
    (sorting?.length
      ? sorting.reduce(
          (acc, sort) => ({ ...acc, [sort.field]: sort.order }),
          {},
        )
      : fallback) || {};

  const invalidKey = Object.keys(orderBy).find(
    key => !isValidSortingField(key, options),
  );

  if (invalidKey)
    throw new AppError({
      key: "@sorting/INVALID_FIELD",
      message: `Invalid sorting field "${invalidKey}".`,
      debug: {
        options,
        sorting,
        common,
        fallback,
      },
    });

  if (overrides)
    Object.entries(overrides).forEach(([key, value]) => {
      if (sorting?.find(sort => sort.field === key)) {
        orderBy = {
          ...orderBy,
          [key]: undefined,
          ...(value as Record<string, SortingOrder>),
        };
      }
    });

  orderBy = {
    ...orderBy,
    ...common,
  };

  return orderBy;
};
