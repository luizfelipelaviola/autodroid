import {
  plainToInstance,
  instanceToPlain,
  ClassTransformOptions,
} from 'class-transformer'

type ClassConstructor<T> = {
  new (...args: any[]): T
}

// Convert plain object to class instance (without applying decorators)
function parse<T, V>(cls: ClassConstructor<T>, obj: V[]): T[]
function parse<T, V>(cls: ClassConstructor<T>, obj: V): T
function parse<T>(cls: ClassConstructor<T>, obj: null): null
function parse<T, V>(cls: ClassConstructor<T>, obj: V) {
  const options: ClassTransformOptions = {
    ignoreDecorators: true,
  }

  if (!obj) return null

  if (Array.isArray(obj))
    return obj.map((item) => plainToInstance(cls, item, options))

  return plainToInstance(cls, obj, options)
}

// Convert class instance to plain object (with decorator transformations)
function plain<T>(obj: T[]): Record<string, any>[]
function plain<T>(obj: T): Record<string, any>
function plain(obj: null): null
function plain<T>(obj: T) {
  const options: ClassTransformOptions = {
    ignoreDecorators: false,
    excludeExtraneousValues: true,
  }

  if (!obj) return null

  if (Array.isArray(obj))
    return obj.map((item) => instanceToPlain(item, options))

  return instanceToPlain(obj, options)
}

export type { ClassConstructor }
export { parse, plain }
