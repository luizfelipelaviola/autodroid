import { AuthChecker } from "type-graphql";

import { GraphQLContext } from "./context";

const authenticationHandler: AuthChecker<GraphQLContext> = (
  { context: { session } },
  roles,
) => {
  // if `@Authorized()`, check only if user exists
  if (roles.length === 0) return session !== undefined;

  if (!session) return false;

  if (roles.includes("ADMIN") && session.is_admin) return true;

  return false;
};

export { authenticationHandler };
