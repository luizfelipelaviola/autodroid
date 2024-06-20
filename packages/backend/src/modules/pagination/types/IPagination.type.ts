import { IPaginationDTO } from "./IPagination.dto";

export interface Cursor {
  created_at: Date;
  id: string;
}

export interface IPageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

export interface IEdge<T> {
  node: T;
  cursor: string;
}

export interface IConnection<T> {
  edges: IEdge<T>[];
  pageInfo: IPageInfo;
  totalCount: number;
}

export type INodeEntity = {
  id: string | number;
  created_at: Date;
  [key: string]: any;
};

export type IMakePaginationConnection<T extends INodeEntity> = {
  items: T[];
  totalCount: number;
  paginationRequest?: IPaginationDTO;

  hasIncludedBoundaries?: boolean;
};
