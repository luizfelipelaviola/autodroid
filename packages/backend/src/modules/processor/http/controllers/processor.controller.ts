import { container } from 'tsyringe'
import { Request, Response } from 'express'

import { UserProcessorIndexService } from '@modules/processor/services/userProcessorIndex.service'
import { UserProcessorShowService } from '@modules/processor/services/userProcessorShow.service'

class ProcessorController {
  public async index(req: Request, res: Response) {
    const userProcessorIndexService = container.resolve(
      UserProcessorIndexService,
    )
    const processor = await userProcessorIndexService.execute()
    return res.json(processor)
  }

  public async show(req: Request, res: Response) {
    const userProcessorShowService = container.resolve(UserProcessorShowService)
    const processor = await userProcessorShowService.execute({
      code: req.params.processor_code,
    })
    return res.json(processor)
  }
}

export default new ProcessorController()
