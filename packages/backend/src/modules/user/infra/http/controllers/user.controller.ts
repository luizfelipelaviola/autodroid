import { container } from 'tsyringe'
import { Request, Response } from 'express'

import { UserCreateService } from '@modules/user/services/userCreate.service'
import { UserShowService } from '@modules/user/services/userShow.service'

class UserController {
  public async create(req: Request, res: Response) {
    const userCreateService = container.resolve(UserCreateService)
    const user = await userCreateService.execute()
    return res.json(user)
  }

  public async show(req: Request, res: Response) {
    const userShowService = container.resolve(UserShowService)
    const user = await userShowService.execute({
      user_id: req.params.user_id,
    })
    return res.json(user)
  }
}

export default new UserController()
