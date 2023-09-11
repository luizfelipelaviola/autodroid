import { Expose } from 'class-transformer'

import { plain } from '@common/util/instanceParser'

class Processor {
  @Expose()
  code: string

  @Expose()
  name: string

  @Expose()
  description: string

  @Expose()
  allowed_params: string[]

  @Expose()
  allowed_mime_types: string[]

  @Expose()
  default_params: Record<string, string>

  public toJSON() {
    return plain(this)
  }

  static make(data: Partial<Processor>) {
    const entity = new Processor()
    Object.assign(entity, data)
    return entity
  }
}

export { Processor }
