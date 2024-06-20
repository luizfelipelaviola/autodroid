import { registerEnumType } from "type-graphql";

enum AUTH_PROVIDER {
  FIREBASE = "FIREBASE",
}

registerEnumType(AUTH_PROVIDER, {
  name: "AUTH_PROVIDER",
});

export { AUTH_PROVIDER };
