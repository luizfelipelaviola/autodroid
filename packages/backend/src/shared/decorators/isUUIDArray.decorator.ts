import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayNotEmpty,
  ArrayUnique,
  IsMongoId,
  IsUUID,
} from "class-validator";

export function IsUUIDArray(
  { mode }: { mode: "4" | "3" | "mongo" } = { mode: "4" },
) {
  const arrayNotEmpty = ArrayNotEmpty();
  const arrayUnique = ArrayUnique();
  const arrayMinSize = ArrayMinSize(1);
  const arrayMaxSize = ArrayMaxSize(100);

  const isId =
    mode === "mongo" ? IsMongoId({ each: true }) : IsUUID(mode, { each: true });

  return (target: any, key: string) => {
    arrayNotEmpty(target, key);
    arrayUnique(target, key);
    arrayMinSize(target, key);
    arrayMaxSize(target, key);
    isId(target, key);
  };
}
