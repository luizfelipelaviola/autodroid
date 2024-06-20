// Util import
import {
  makeSortingObj,
  IMakeSortingParams,
  SortingOrder,
} from "../makeSortingObj";

type NullSortingOrder = "first" | "last";

type ISortWithNulls = {
  sort: SortingOrder;
  nulls: NullSortingOrder;
};

type NullOverrides<T extends readonly string[]> = {
  [key in T[number]]?: NullSortingOrder;
};

type ISortingObjArr<T extends readonly string[]> = {
  [key in T[number]]: SortingOrder;
}[];

export const makeSortingArr = <T extends readonly string[]>(
  params: IMakeSortingParams<T>,
): ISortingObjArr<T> => {
  const orderBy = makeSortingObj(params);

  return Object.entries(orderBy).map(([field, order]) => ({
    [field]: order,
  })) as ISortingObjArr<T>;
};

export const makeSortingArrWithNulls = <
  T extends readonly string[],
  U extends NullOverrides<T>,
>(
  arr: ISortingObjArr<T>,
  nullOverrides: U,
) =>
  arr.map(order => {
    const field = Object.keys(order)[0] as T[number];
    const nullOverride = nullOverrides[field];

    if (nullOverride) {
      return {
        [field]: {
          sort: order[field] as SortingOrder,
          nulls: nullOverride,
        },
      };
    }

    return order;
  }) as Array<{
    [K in T[number]]: K extends keyof U ? ISortWithNulls : SortingOrder;
  }>;

export type { ISortWithNulls };
