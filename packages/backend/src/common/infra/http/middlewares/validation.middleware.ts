import { NextFunction, Request, Response } from 'express'
import { validateOrReject, ValidationError } from 'class-validator'
import { ClassConstructor, plainToInstance } from 'class-transformer'

import { AppError } from '@common/errors/AppError'

enum Segments {
  BODY,
  COOKIES,
  HEADERS,
  PARAMS,
  QUERY,
  SIGNEDCOOKIES,
}

const segmentMap: { [key in Segments]: keyof Request } = {
  [Segments.BODY]: 'body',
  [Segments.COOKIES]: 'cookies',
  [Segments.HEADERS]: 'headers',
  [Segments.PARAMS]: 'params',
  [Segments.QUERY]: 'query',
  [Segments.SIGNEDCOOKIES]: 'signedCookies',
}

async function validateSchema<T extends object>(params: {
  value: any
  schema: ClassConstructor<T>
}) {
  const { schema, value } = params

  const cls = plainToInstance(schema, value)

  try {
    await validateOrReject(cls)
  } catch (err) {
    if (Array.isArray(err) && err[0] instanceof ValidationError)
      throw new AppError({
        key: '@general/VALIDATION_FAIL',
        message:
          Object.values(err[0].constraints || {})[0] || 'Validation error.',
      })
    throw new AppError({
      key: '@general/VALIDATION_FATAL_FAILURE',
      message: 'Validation fatal server failure.',
      statusCode: 500,
    })
  }
}

function validationMiddleware<T extends object>(params: {
  schema: ClassConstructor<T>
  segment: Segments
}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const option = segmentMap[params.segment]
    if (option === undefined)
      throw new AppError({
        key: '@general/INVALID_SEGMENT',
        message: 'Invalid segment.',
      })

    await validateSchema({
      value: req[option],
      schema: params.schema,
    })

    return next()
  }
}

export { Segments, validateSchema, validationMiddleware }
