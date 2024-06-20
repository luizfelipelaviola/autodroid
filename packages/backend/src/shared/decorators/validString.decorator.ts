import { IsString, MinLength, MaxLength } from "class-validator";
import { TrimStringTransform } from "./trimStringTransform.decorator";
import { IsNullable, NullableOptions } from "./isNullable.decorator";

export function ValidString(
  props: { nullable?: NullableOptions } = {
    nullable: false,
  },
) {
  const isString = IsString();
  const minLength = MinLength(1);
  const maxLength = MaxLength(255);

  const isNullable = IsNullable({ nullable: props.nullable });

  const trimStringTransform = TrimStringTransform();

  return (target: any, key: string) => {
    if (props.nullable) isNullable(target, key);
    isString(target, key);
    minLength(target, key);
    maxLength(target, key);
    trimStringTransform(target, key);
  };
}
