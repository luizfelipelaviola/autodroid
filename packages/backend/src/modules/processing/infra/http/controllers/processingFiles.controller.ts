import { container } from 'tsyringe'
import express, { NextFunction, Request, Response } from 'express'

import { UserProcessingShowService } from '@modules/processing/services/userProcessingShow.service'
import path from 'path'

class ProcessingFileController {
  public async show(req: Request, res: Response, next: NextFunction) {
    const userProcessingShowService = container.resolve(
      UserProcessingShowService,
    )
    const { processing } = await userProcessingShowService.execute({
      user: req.user,
      processing_id: req.params.processing_id,
    })

    req.url = path.basename(req.originalUrl)
    express.static(
      path.join(process.cwd(), processing.destination, processing.id),
    )(req, res, next)
  }
}

export default new ProcessingFileController()
