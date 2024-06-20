import { ClassType, Field, ObjectType } from "type-graphql";

// Scalar import
import { ConnectionCursor } from "@modules/pagination/types/paginationConnectionCursor.scalar";

// Type import
import { IEdge, INodeEntity } from "../types/IPagination.type";

const PaginationEdge = <IEntity extends INodeEntity>(
  EntityClass: ClassType<IEntity>,
) => {
  @ObjectType(
    `${EntityClass.name || (EntityClass as unknown as symbol).description}PaginationEdge`,
  )
  abstract class PaginationEdgeClass implements IEdge<IEntity> {
    @Field(() => EntityClass)
    node: IEntity;

    @Field(() => ConnectionCursor)
    cursor: string;
  }

  return PaginationEdgeClass;
};

export { PaginationEdge };
