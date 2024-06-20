import { Field, ID, ObjectType } from "type-graphql";
import { Exclude, Type } from "class-transformer";

// Configuration import
import { getAdminConfig } from "@config/admin";

// Type import
import { UserEntityType } from "@shared/types/models";

// Entity import
import { PaginationConnection } from "@modules/pagination/entities/paginationConnection.entity";
import { UserAuthProviderConn } from "./userAuthProviderConn.entity";

@ObjectType()
class User implements UserEntityType {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field(() => String, { nullable: true })
  name: string | null;

  @Field(() => String, { nullable: true })
  phone_number: string | null;

  @Field(() => String, { nullable: true })
  language: string | null;

  @Field()
  created_at: Date;

  @Field()
  updated_at: Date;

  /* Computed fields */

  get is_admin(): boolean {
    return (
      !!this.email &&
      !!getAdminConfig().emails.find(adminEmail => adminEmail === this.email)
    );
  }

  /* Relations */

  @Exclude()
  @Type(() => UserAuthProviderConn)
  auth_provider_conns: UserAuthProviderConn[];
}

const PaginatedUser = PaginationConnection(User);
export type PaginatedUser = InstanceType<typeof PaginatedUser>;

export { User, PaginatedUser };
