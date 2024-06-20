// DTO import
import {
  IProcessedPaginationDTO,
  IPaginationDTO,
} from "@modules/pagination/types/IPagination.dto";
import { isCursor } from "@modules/pagination/types/paginationConnectionCursor.scalar";

// Util import
import { makeCursorObjFromEntity } from "../makeCursorObjFromEntity";

const makePaginationObj = (
  paginationSchema?: IPaginationDTO,
): IProcessedPaginationDTO => {
  const defaultPagination = {
    cursor: undefined,
    skip: 0,
    take: undefined,
  };

  if (!paginationSchema) return defaultPagination;

  const {
    /** Before cursor pagination */
    before,
    last,

    /** After cursor pagination */
    after,
    first,

    /** Skip and take pagination */
    skip,
    take,
  } = paginationSchema;

  if (!before && !after && !skip && !take) return defaultPagination;

  if (
    (!!before || !!last || typeof last === "number") &&
    (!!after || !!first || typeof first === "number") &&
    (!!skip || typeof skip === "number" || !!take || typeof take === "number")
  )
    throw new Error("Cannot mix pagination strategies.");

  if (before) {
    if (!isCursor(before)) throw new Error("Cursor is not valid.");

    if (!last || typeof last !== "number" || last < 1)
      throw new Error("Cannot use before without last.");

    return {
      cursor: makeCursorObjFromEntity(before),
      skip: 0,
      take: -(last + 2)!,
    };
  }

  if (after) {
    if (!isCursor(after)) throw new Error("Cursor is not valid.");

    if (!first || typeof first !== "number" || first < 1)
      throw new Error("Cannot use after without first.");

    return {
      cursor: makeCursorObjFromEntity(after),
      skip: 0,
      take: (first + 2)!,
    };
  }

  if (typeof skip === "number") {
    if (skip < 0) throw new Error("Cannot use negative numbers for skip.");

    // Allow server created queries like just { skip: 0 }
    if (take !== undefined && typeof take !== "number")
      throw new Error("Take should be a number");

    return {
      cursor: undefined,
      skip,
      take,
    };
  }

  throw new Error("Invalid pagination strategy.");
};

export { makePaginationObj };
