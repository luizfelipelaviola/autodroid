import { container } from 'tsyringe'
import fs from 'node:fs'
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

    const filePath = path.join(
      process.cwd(),
      processing.destination,
      processing.id,
      req.params[0],
    )
    if (!fs.existsSync(filePath)) return res.status(404).send()
    if (!fs.lstatSync(filePath).isFile()) return res.status(404).send()

    const staticPath = path.join(
      process.cwd(),
      processing.destination,
      processing.id,
    )
    req.url = req.params[0]
    express.static(staticPath)(req, res, next)
  }
}

export default new ProcessingFileController()
