import { NextFunction, Request, Response } from 'express'
import util from 'util'
import Youch from 'youch'

import { AppError } from '@common/errors/AppError'

const errorMiddleware = async (
  err: Error,
  req: Request,
  res: Response,
  _: NextFunction,
): Promise<Response<any> | void> => {
  if (err instanceof AppError) {
    if (err.key && err.message)
      return res.status(err.statusCode).json({
        code: err.key,
        message: err.message,
        ...(err.debug && {
          fatal: true,
        }),
      })
    return res.status(err.statusCode).send()
  }

  const errors = await new Youch(err, req).toJSON()

  if (String(errors.error?.message).includes('JSON'))
    return res.status(400).json({
      code: '@general/JSON_ERROR',
      message: 'Your request has problems on the JSON structure.',
    })

  console.log(
    `❌ Application failure: `,
    util.inspect(errors, false, null, true),
  )

  return res.status(500).json({
    code: '@general/INTERNAL_SERVER_ERROR',
    message: 'Internal server error.',
    fatal: true,
  })
}

export { errorMiddleware }
