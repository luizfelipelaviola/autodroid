import { Expose, Type } from 'class-transformer'

import { plain } from '@common/util/instanceParser'
import { File } from '@modules/file/entities/file.entity'
import { User } from '@modules/user/entities/user.entity'
import { DatasetEntityType } from '@common/types/models'
import { Processing } from '@modules/processing/entities/processing.entity'

class Dataset implements DatasetEntityType {
  @Expose()
  id: string

  @Expose()
  description: string

  @Expose()
  user_id: string

  @Expose()
  @Type(() => User)
  user: User

  @Expose()
  file_id: string

  @Expose()
  @Type(() => File)
  file: File

  @Expose()
  processings: Processing[]

  @Expose()
  created_at: Date

  @Expose()
  updated_at: Date

  public toJSON() {
    return plain(this)
  }
}

export { Dataset }
