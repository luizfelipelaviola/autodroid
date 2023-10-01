import { injectable } from 'tsyringe'

import processors from '@/shared/processors.json'
import { Processor } from '../entities/processor.entity'
import { AppError } from '@common/errors/AppError'

interface IRequest {
  code: string
}

@injectable()
class UserProcessorShowService {
  public async execute({ code }: IRequest): Promise<Processor> {
    const processor = processors.find((processor) => processor.code === code)
    if (!processor)
      throw new AppError({
        key: '@user_processor_show_service/PROCESSOR_NOT_FOUND',
        message: 'Processor not found',
      })

    return Processor.make({
      code,
      name: processor.name,
      description: processor.description,
      allowed_params: processor.allowed_params,
      allowed_mime_types: processor.allowed_mime_types,
      default_params: processor.default_params,
    })
  }
}

export { UserProcessorShowService }
