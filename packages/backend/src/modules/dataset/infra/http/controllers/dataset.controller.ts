import { container } from 'tsyringe'
import { Request, Response } from 'express'

import { UserDatasetCreateService } from '@modules/dataset/services/userDatasetCreate.service'
import { UserDatasetIndexService } from '@modules/dataset/services/userDatasetIndex.service'
import { UserDatasetShowService } from '@modules/dataset/services/userDatasetShow.service'
import { UserDatasetUpdateService } from '@modules/dataset/services/userDatasetUpdate.service'
import { UserDatasetDeleteService } from '@modules/dataset/services/userDatasetDelete.service'

class DatasetController {
  public async create(req: Request, res: Response) {
    const userDatasetCreateService = container.resolve(UserDatasetCreateService)
    const dataset = await userDatasetCreateService.execute({
      request: req,
      response: res,
    })
    return res.status(201).json(dataset)
  }

  public async index(req: Request, res: Response) {
    const userDatasetIndexService = container.resolve(UserDatasetIndexService)
    const dataset = await userDatasetIndexService.execute({
      user: req.user,
    })
    return res.json(dataset)
  }

  public async show(req: Request, res: Response) {
    const userDatasetShowService = container.resolve(UserDatasetShowService)
    const dataset = await userDatasetShowService.execute({
      user: req.user,
      dataset_id: req.params.dataset_id,
    })
    return res.json(dataset)
  }

  public async update(req: Request, res: Response) {
    const userDatasetUpdateService = container.resolve(UserDatasetUpdateService)
    const dataset = await userDatasetUpdateService.execute({
      user: req.user,
      dataset_id: req.params.dataset_id,
      data: {
        description: req.body.description,
      },
    })
    return res.json(dataset)
  }

  public async delete(req: Request, res: Response) {
    const userDatasetDeleteService = container.resolve(UserDatasetDeleteService)
    const dataset = await userDatasetDeleteService.execute({
      user: req.user,
      dataset_id: req.params.dataset_id,
    })
    return res.json(dataset)
  }
}

export default new DatasetController()
