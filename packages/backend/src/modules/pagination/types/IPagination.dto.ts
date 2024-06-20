// Interface import
import { Cursor } from "./IPagination.type";

export interface IPaginationDTO {
  /** Before cursor pagination */
  before?: Cursor | null;
  last?: number | null;

  /** After cursor pagination */
  after?: Cursor | null;
  first?: number | null;

  /** Skip and take pagination */
  skip?: number | null;
  take?: number | null;
}

export interface IProcessedPaginationDTO {
  cursor?: Cursor;
  skip: number;
  take?: number;
}
