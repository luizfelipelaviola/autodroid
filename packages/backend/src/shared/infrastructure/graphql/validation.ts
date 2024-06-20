import { instanceToInstance } from "class-transformer";
import { validateOrReject, ValidatorOptions } from "class-validator";
import { ArgumentValidationError } from "type-graphql";

export async function validationHandler<T extends object>(
  argValue: T | undefined,
  _: any,
): Promise<any> {
  if (argValue == null || typeof argValue !== "object") return argValue;

  const validatorOptions: ValidatorOptions = {};

  try {
    if (Array.isArray(argValue)) {
      await Promise.all(
        argValue.map(argItem => validateOrReject(argItem, validatorOptions)),
      );
    } else {
      await validateOrReject(argValue, validatorOptions);
    }
    Object.assign(argValue, instanceToInstance(argValue));
    return argValue;
  } catch (err: any) {
    throw new ArgumentValidationError(err);
  }
}
