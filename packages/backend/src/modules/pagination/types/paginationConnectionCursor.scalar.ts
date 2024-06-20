import { GraphQLError, GraphQLScalarType, Kind } from "graphql";
import validator from "validator";

// Error import
import { AppError } from "@shared/errors/AppError";

// Enum import
import { CURSORS, AVAILABLE_CURSOR } from "../constants/cursors.constant";

// Interface import
import { Cursor } from "./IPagination.type";

const isCursor = (value: unknown): value is Cursor => {
  if (!value || typeof value !== "object" || value === null) return false;

  const cursorKeys = Object.keys(value) as AVAILABLE_CURSOR[];

  if (cursorKeys.length !== CURSORS.length) return false;
  if (
    CURSORS.some(
      (sysCursor, cursorOrder) =>
        cursorKeys.findIndex(reqCursor => reqCursor === sysCursor) !==
        cursorOrder,
    )
  )
    return false;

  return true;
};
const serializeCursor = (cursor: Cursor | unknown): string => {
  try {
    if (!isCursor(cursor)) throw new Error("Cursor is not valid.");
    return Buffer.from(JSON.stringify(cursor)).toString("base64");
  } catch (error) {
    AppError.make({
      key: "@cursor_serialize/FAIL",
      message: "Fail to serialize cursor.",
      debug: {
        cursor,
        error,
      },
    });
    throw new GraphQLError("Fail to serialize the cursor");
  }
};
const parseCursor = (str: string): Cursor => {
  try {
    const cursor = JSON.parse(Buffer.from(str, "base64").toString("ascii"));
    if (!isCursor(cursor)) throw new Error("Cursor is not valid.");
    return cursor;
  } catch (error) {
    AppError.make({
      key: "@cursor_parse/FAIL",
      message: "Fail to parse cursor.",
      debug: {
        str,
        error,
      },
    });

    throw new GraphQLError("ConnectionCursor must be a cursor");
  }
};

const ConnectionCursor = new GraphQLScalarType({
  name: "ConnectionCursor",
  description: "Cursor for pagination",
  serialize: (value: unknown) => {
    if (typeof value === "string" && validator.isBase64(value)) return value;
    return serializeCursor(value);
  },
  parseValue: (str: unknown) => {
    if (typeof str !== "string")
      throw new GraphQLError("ConnectionCursor must be a string.");
    if (!validator.isBase64(str)) return str;
    return parseCursor(str);
  },
  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING || typeof ast.value !== "string")
      throw new GraphQLError("ConnectionCursor must be a string.");
    if (!validator.isBase64(ast.value)) return ast.value;
    return parseCursor(ast.value);
  },
});

export { ConnectionCursor, isCursor, serializeCursor, parseCursor };
