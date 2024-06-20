// Enum import
import { SORT_ORDER } from "./sortOrder.enum";

type ISortingDTO<T extends readonly string[]> = {
  field: T[number];
  order: SORT_ORDER;
}[];

export { ISortingDTO };
