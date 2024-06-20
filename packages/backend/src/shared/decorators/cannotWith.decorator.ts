import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";

@ValidatorConstraint({ async: false })
class CannotWithConstraint implements ValidatorConstraintInterface {
  validate(
    _value: unknown,
    { constraints, ...args }: ValidationArguments,
  ): boolean {
    const object = args.object as any;
    return constraints.every(constraint =>
      ["undefined", "null"].includes(typeof object[constraint]),
    );
  }

  defaultMessage({ property, constraints }: ValidationArguments): string {
    const join = constraints.join(", ");
    return `${property} cannot be used with ${join}`;
  }
}

const CannotWith = (props: Array<string>, options?: ValidationOptions) => {
  return (
    // eslint-disable-next-line @typescript-eslint/ban-types
    { constructor: target }: Object,
    propertyName: string,
  ): void => {
    registerDecorator({
      target,
      propertyName,
      options,
      constraints: props,
      validator: CannotWithConstraint,
    });
  };
};

export { CannotWith };
