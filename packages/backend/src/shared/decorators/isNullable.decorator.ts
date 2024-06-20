import { IsNotEmpty, IsOptional, ValidateIf, NotEquals } from "class-validator";

export type NullableOptions =
  | boolean
  | "allowNull"
  | "allowUndefined"
  | undefined;

export function IsNullable(
  props: { nullable?: NullableOptions } = {
    nullable: true,
  },
) {
  const isOptional = IsOptional();
  const isNotEmpty = IsNotEmpty();

  const validateAllowNull = ValidateIf((_, value) => value !== null);
  const validateAllowUndefined = ValidateIf((_, value) => value !== undefined);

  const notNull = NotEquals(null);
  const notUndefined = NotEquals(undefined);

  return (target: any, key: string) => {
    if (props.nullable === true) isOptional(target, key);
    else if (props.nullable === "allowNull") {
      validateAllowNull(target, key);
      notUndefined(target, key);
    } else if (props.nullable === "allowUndefined") {
      validateAllowUndefined(target, key);
      notNull(target, key);
    } else isNotEmpty(target, key);
  };
}
