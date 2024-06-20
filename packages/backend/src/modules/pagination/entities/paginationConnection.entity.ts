import { ClassType, Field, Int, ObjectType } from "type-graphql";

// Constant import
import { TAKE_DEFAULT } from "@modules/pagination/constants/paginationLimit.constant";

// Util import
import { makePaginationObj } from "../utils/makePaginationObj";
import { serializeCursor } from "../types/paginationConnectionCursor.scalar";
import { makeCursorObjFromEntity } from "../utils/makeCursorObjFromEntity";

// Entity import
import { PageInfo } from "./pageInfo.entity";
import { PaginationEdge } from "./paginationEdge.entity";

// Type import
import {
  IConnection,
  IMakePaginationConnection,
  INodeEntity,
} from "../types/IPagination.type";

export function PaginationConnection<IEntity extends INodeEntity>(
  EntityClass: ClassType<IEntity>,
) {
  const EntityEdge = PaginationEdge(EntityClass);
  type IEntityEdge = InstanceType<typeof EntityEdge>;

  @ObjectType(
    `${EntityClass.name || (EntityClass as unknown as symbol).description}PaginationConnection`,
  )
  class PaginationConnectionClass implements IConnection<IEntity> {
    @Field(() => [EntityEdge])
    edges: IEntityEdge[];

    @Field(() => PageInfo)
    pageInfo: PageInfo;

    @Field(() => Int)
    totalCount: number;

    static make({
      items,
      totalCount,
      paginationRequest,

      hasIncludedBoundaries = true,
    }: IMakePaginationConnection<IEntity>) {
      const connection = new PaginationConnectionClass();

      const pagination = makePaginationObj(paginationRequest);
      if (!pagination.take) pagination.take = TAKE_DEFAULT;

      connection.totalCount = totalCount;

      // Cursor pagination
      if (pagination.cursor) {
        const cursorIndex = items.findIndex(
          item => item.id === pagination.cursor?.id,
        );

        const hasPreviousPage = cursorIndex >= 0;
        const itemsWithoutCursor =
          hasIncludedBoundaries && cursorIndex >= 0
            ? pagination.take > 0
              ? items.slice(cursorIndex + 1)
              : items.slice(0, cursorIndex)
            : items;

        const hasNextPage =
          itemsWithoutCursor.length > Math.abs(pagination.take - 2);

        const itemsWithoutExcess = hasNextPage
          ? pagination.take > 0
            ? itemsWithoutCursor.slice(0, Math.abs(pagination.take) - 2)
            : itemsWithoutCursor.slice(1)
          : itemsWithoutCursor;

        connection.edges = itemsWithoutExcess.map(item => ({
          node: item,
          cursor: serializeCursor(makeCursorObjFromEntity(item)),
        }));

        connection.pageInfo = {
          startCursor: connection.edges[0]?.cursor || null,
          endCursor: connection.edges.slice(-1)[0]?.cursor || null,
          hasPreviousPage,
          hasNextPage,
        };
      }

      // Skip take pagination
      else {
        connection.edges = items.map(item => ({
          node: item,
          cursor: serializeCursor(makeCursorObjFromEntity(item)),
        }));

        connection.pageInfo = {
          startCursor: connection.edges[0]?.cursor || null,
          endCursor: connection.edges.slice(-1)[0]?.cursor || null,
          hasPreviousPage: pagination.skip > 0,
          hasNextPage: pagination.skip + pagination.take < totalCount,
        };
      }

      return connection;
    }
  }

  return PaginationConnectionClass;
}
