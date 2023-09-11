import { container } from 'tsyringe'
import { Request, Response } from 'express'
import path from 'path'

import { UserDatasetShowService } from '@modules/dataset/services/userDatasetShow.service'

class DatasetFileController {
  public async show(req: Request, res: Response) {
    const userDatasetShowService = container.resolve(UserDatasetShowService)
    const dataset = await userDatasetShowService.execute({
      user: req.user,
      dataset_id: req.params.dataset_id,
    })
    return res.sendFile(
      path.join(process.cwd(), dataset.file.destination, dataset.file.filename),
    )
  }
}

export default new DatasetFileController()
