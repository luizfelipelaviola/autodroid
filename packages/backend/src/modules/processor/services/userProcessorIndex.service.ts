import { injectable } from 'tsyringe'

import processors from '@/shared/processors.json'
import { Processor } from '../entities/processor.entity'

@injectable()
class UserProcessorIndexService {
  public async execute(): Promise<Processor[]> {
    return processors.map((processor) =>
      Processor.make({
        code: processor.code,
        name: processor.name,
        description: processor.description,
        allowed_params: processor.allowed_params,
        allowed_mime_types: processor.allowed_mime_types,
        default_params: processor.default_params,
      }),
    )
  }
}

export { UserProcessorIndexService }
