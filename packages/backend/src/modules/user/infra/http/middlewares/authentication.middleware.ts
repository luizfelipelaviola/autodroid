import { NextFunction, Request, Response } from 'express'
import { container } from 'tsyringe'

import { UserShowService } from '@modules/user/services/userShow.service'
import { AppError } from '@common/errors/AppError'

const authenticationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { headers } = req
  const { authorization } = headers

  try {
    if (authorization) {
      const userShowService = container.resolve(UserShowService)

      const user = await userShowService.execute({
        user_id: authorization.split(' ')[1],
      })

      req.user = user

      return next()
    }
  } catch {
    throw new AppError({
      key: '@authentication/UNAUTHORIZED',
      message: 'Unauthorized.',
      statusCode: 401,
    })
  }

  throw new AppError({
    key: '@authentication/UNAUTHORIZED',
    message: 'Unauthorized.',
    statusCode: 401,
  })
}

export { authenticationMiddleware }
