import { Matches } from "class-validator";

// Decorator import
import { ValidString } from "./validString.decorator";

export function NameString(props: { nullable?: boolean } = {}) {
  const isValidString = ValidString(props);
  const match = Matches(/^[\p{L} ,.'-]+$/u, {
    message: args => `${args.property} should contain only letters and spaces`,
  });

  return (target: any, key: string) => {
    isValidString(target, key);
    match(target, key);
  };
}
