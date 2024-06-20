import { Field, ObjectType } from "type-graphql";

// Type import
import { IPageInfo } from "../types/IPagination.type";

@ObjectType()
class PageInfo implements IPageInfo {
  @Field()
  hasNextPage: boolean;

  @Field()
  hasPreviousPage: boolean;

  @Field(() => String, { nullable: true })
  startCursor: string | null;

  @Field(() => String, { nullable: true })
  endCursor: string | null;
}

export { PageInfo };
