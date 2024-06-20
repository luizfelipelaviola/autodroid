import { IsInt, IsOptional, Max, Min } from "class-validator";
import { ArgsType, Field, Int } from "type-graphql";

// Scalar import
import { ConnectionCursor } from "@modules/pagination/types/paginationConnectionCursor.scalar";

// Decorator import
import { OnlyWith } from "@shared/decorators/onlyWith.decorator";
import { CannotWith } from "@shared/decorators/cannotWith.decorator";

// Constant import
import { TAKE_LIMIT } from "../constants/paginationLimit.constant";

// Interface import
import { IPaginationDTO } from "../types/IPagination.dto";
import { Cursor } from "../types/IPagination.type";

@ArgsType()
export class SimplePaginationSchema implements IPaginationDTO {
  /**
   * Skip and take pagination
   */

  @IsInt()
  @Min(0)
  @IsOptional()
  @OnlyWith(["take"])
  @CannotWith(["before", "last", "after", "first"])
  @Field(() => Int, { nullable: true })
  skip: number;

  @IsInt()
  @Min(1)
  @Max(TAKE_LIMIT)
  @IsOptional()
  @OnlyWith(["skip"])
  @CannotWith(["before", "last", "after", "first"])
  @Field(() => Int, { nullable: true })
  take: number;
}

@ArgsType()
export class PaginationSchema
  extends SimplePaginationSchema
  implements IPaginationDTO
{
  /**
   * Before cursor pagination
   */

  @IsOptional()
  @OnlyWith(["last"])
  @CannotWith(["after", "first"])
  @Field(() => ConnectionCursor, { nullable: true })
  before?: Cursor | null;

  @IsInt()
  @Min(1)
  @Max(TAKE_LIMIT)
  @IsOptional()
  @OnlyWith(["before"])
  @CannotWith(["after", "first"])
  @Field(() => Int, { nullable: true })
  last?: number | null;

  /**
   * After cursor pagination
   */

  @IsOptional()
  @OnlyWith(["first"])
  @CannotWith(["before", "last"])
  @Field(() => ConnectionCursor, { nullable: true })
  after?: Cursor | null;

  @IsInt()
  @Min(1)
  @Max(TAKE_LIMIT)
  @IsOptional()
  @OnlyWith(["after"])
  @CannotWith(["before", "last"])
  @Field(() => Int, { nullable: true })
  first?: number | null;
}
