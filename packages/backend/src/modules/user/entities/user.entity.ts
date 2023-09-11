import { Expose } from 'class-transformer'

import { plain } from '@common/util/instanceParser'
import { UserEntityType } from '@common/types/models'
import { Dataset } from '@modules/dataset/entities/dataset.entity'

class User implements UserEntityType {
  @Expose()
  id: string

  datasets: Dataset[]

  @Expose()
  created_at: Date

  @Expose()
  updated_at: Date

  public toJSON() {
    return plain(this)
  }
}

export { User }
