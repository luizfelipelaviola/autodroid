import { Field, InputType } from "type-graphql";
import { IsLocale, IsPhoneNumber } from "class-validator";

// Decorator import
import { ValidString } from "@shared/decorators/validString.decorator";
import { NameString } from "@shared/decorators/nameString.decorator";

// DTO import
import { IUpdateUserDTO } from "../types/IUser.dto";

@InputType()
class UserUpdateDataSchema implements IUpdateUserDTO {
  @NameString()
  @Field()
  name: string;

  @ValidString()
  @IsPhoneNumber()
  @Field(() => String, { nullable: true })
  phone_number?: string | null;

  @ValidString()
  @IsLocale()
  @Field(() => String, { nullable: true })
  language?: string | null;
}

export { UserUpdateDataSchema };
