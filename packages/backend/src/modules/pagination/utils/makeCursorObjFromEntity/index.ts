// Constant import
import { CURSORS } from "@modules/pagination/constants/cursors.constant";

// Type import
import {
  Cursor,
  INodeEntity,
} from "@modules/pagination/types/IPagination.type";

const makeCursorObjFromEntity = (entity: INodeEntity): Cursor =>
  CURSORS.reduce((acc, cursor) => {
    if (!entity[cursor]) throw new Error("Unable to get cursor value");
    return { ...acc, [cursor]: entity[cursor] };
  }, {} as Cursor);

export { makeCursorObjFromEntity };
