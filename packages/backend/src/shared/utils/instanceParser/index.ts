import {
  plainToInstance,
  instanceToPlain,
  ClassTransformOptions,
} from "class-transformer";

type ClassConstructor<T> = {
  new (...args: any[]): T;
};

// Convert plain object to class instance (without applying decorators)
function parse<T, V>(cls: ClassConstructor<T>, obj: V[]): T[];
function parse<T, V>(cls: ClassConstructor<T>, obj: V): T;
function parse<T>(cls: ClassConstructor<T>, obj: null): null;
function parse<T, V>(cls: ClassConstructor<T>, obj: V) {
  const options: ClassTransformOptions = {
    ignoreDecorators: true,
  };

  if (!obj) return null;

  if (Array.isArray(obj))
    return obj.map(item => plainToInstance(cls, item, options));

  return plainToInstance(cls, obj, options);
}

// Convert class instance to plain object (with decorator transformations)
function process<T>(obj: T[]): Record<string, any>[];
function process<T>(obj: T): Record<string, any>;
function process(obj: null): null;
function process<T>(obj: T) {
  const options: ClassTransformOptions = {
    ignoreDecorators: false,
  };

  if (!obj) return null;

  if (Array.isArray(obj))
    return obj.map(item => instanceToPlain(item, options));

  return instanceToPlain(obj, options);
}

export type { ClassConstructor };
export { parse, process };
