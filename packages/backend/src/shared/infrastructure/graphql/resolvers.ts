import { BuildSchemaOptions } from "type-graphql";

/**
 * General
 */

/**
 * Admin
 */

/**
 * User
 */
import { UserResolver } from "@modules/user/infrastructure/graphql/resolvers/user.resolver";
import { UserUpdateDataResolver } from "@modules/user/infrastructure/graphql/resolvers/userUpdateData.resolver";
import { UserSessionResolver } from "@modules/user/infrastructure/graphql/resolvers/userSession.resolver";

const { resolvers }: Pick<BuildSchemaOptions, "resolvers"> = {
  resolvers: [
    /**
     * General
     */

    /**
     * Admin
     */

    /**
     * User
     */
    UserResolver,
    UserUpdateDataResolver,
    UserSessionResolver,
  ],
};

export { resolvers };
