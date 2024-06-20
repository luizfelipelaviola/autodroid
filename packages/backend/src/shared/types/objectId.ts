import { GraphQLScalarType, Kind } from "graphql";
import mongoose from "mongoose";

const MongoObjectIdClass = mongoose.Types.ObjectId;

const ObjectId = new GraphQLScalarType({
  name: "ObjectId",
  description: "Mongo object id scalar type",
  serialize(value: unknown): string {
    if (!(value instanceof MongoObjectIdClass)) {
      throw new Error("ObjectIdScalar can only serialize ObjectId values");
    }
    return value.toHexString();
  },
  parseValue(value: unknown): mongoose.Types.ObjectId {
    if (typeof value !== "string")
      throw new Error("ObjectIdScalar can only parse string values");

    return new MongoObjectIdClass(value);
  },
  parseLiteral(ast): mongoose.Types.ObjectId {
    if (ast.kind !== Kind.STRING)
      throw new Error("ObjectIdScalar can only parse string values");
    return new MongoObjectIdClass(ast.value);
  },
});

export type ObjectId = mongoose.Types.ObjectId;
export { ObjectId };
