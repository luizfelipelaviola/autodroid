import { Expose, Type } from 'class-transformer'

import { STORAGE_PROVIDER } from '../types/storageProvider.enum'
import { plain } from '@common/util/instanceParser'
import { FileEntityType } from '@common/types/models'
import { Dataset } from '@modules/dataset/entities/dataset.entity'

class File implements FileEntityType {
  @Expose()
  id: string

  storage_provider: STORAGE_PROVIDER

  @Expose()
  filename: string

  destination: string

  @Expose()
  mime_type: string

  @Expose()
  extension: string

  @Expose()
  size: number

  payload: Record<string, any>

  @Expose()
  created_at: Date

  @Expose()
  updated_at: Date

  @Type(() => Dataset)
  dataset: Dataset

  public toJSON() {
    return plain(this)
  }
}

export { File }
