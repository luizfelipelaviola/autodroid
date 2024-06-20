import { Transform } from "class-transformer";

// Util import
import { trimString } from "@shared/utils/trimString";

export function TrimStringTransform() {
  const transform = Transform(({ value }) => {
    if (!value) return value;
    return trimString(value);
  });

  return (target: any, key: string) => {
    transform(target, key);
  };
}
