import { container } from 'tsyringe'
import { Request, Response } from 'express'

import { UserProcessingCreateService } from '@modules/processing/services/userProcessingCreate.service'
import { UserProcessingIndexService } from '@modules/processing/services/userProcessingIndex.service'
import { UserProcessingShowService } from '@modules/processing/services/userProcessingShow.service'
import { UserProcessingDeleteService } from '@modules/processing/services/userProcessingDelete.service'

class ProcessingController {
  public async create(req: Request, res: Response) {
    const userProcessingCreateService = container.resolve(
      UserProcessingCreateService,
    )
    const processing = await userProcessingCreateService.execute({
      dataset_id: req.body.dataset_id,
      processor: req.body.processor,
      params: req.body.params,
      user: req.user,
    })
    return res.status(201).json(processing)
  }

  public async index(req: Request, res: Response) {
    const userProcessingIndexService = container.resolve(
      UserProcessingIndexService,
    )
    const processing = await userProcessingIndexService.execute({
      user: req.user,
    })
    return res.json(processing)
  }

  public async show(req: Request, res: Response) {
    const userProcessingShowService = container.resolve(
      UserProcessingShowService,
    )
    const { processing, files } = await userProcessingShowService.execute({
      user: req.user,
      processing_id: req.params.processing_id,
    })
    return res.json({
      processing: {
        ...processing,
        files,
      },
    })
  }

  public async delete(req: Request, res: Response) {
    const userProcessingDeleteService = container.resolve(
      UserProcessingDeleteService,
    )
    const processing = await userProcessingDeleteService.execute({
      user: req.user,
      processing_id: req.params.processing_id,
    })
    return res.json(processing)
  }
}

export default new ProcessingController()
