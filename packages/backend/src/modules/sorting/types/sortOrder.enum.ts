import { registerEnumType } from "type-graphql";

enum SORT_ORDER {
  ASC = "asc",
  DESC = "desc",
}

registerEnumType(SORT_ORDER, {
  name: "SORT_ORDER",
});

export { SORT_ORDER };
