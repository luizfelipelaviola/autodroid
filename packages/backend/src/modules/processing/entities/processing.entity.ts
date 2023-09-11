import { Expose } from 'class-transformer'

import { plain } from '@common/util/instanceParser'
import { ProcessingEntityType } from '@common/types/models'
import { Dataset } from '@modules/dataset/entities/dataset.entity'
import { PROCESSING_STATUS } from '../types/processingStatus.enum'

class Processing implements ProcessingEntityType {
  @Expose()
  id: string

  @Expose()
  dataset_id: string

  @Expose()
  dataset: Dataset

  @Expose()
  started_at: Date | null

  @Expose()
  finished_at: Date | null

  @Expose()
  retries: number

  @Expose()
  processor: string

  destination: string

  @Expose()
  payload: Record<string, any>

  @Expose()
  params: Record<string, any>

  @Expose()
  status: PROCESSING_STATUS

  @Expose()
  status_description: string

  @Expose()
  created_at: Date

  @Expose()
  updated_at: Date

  public toJSON() {
    return plain(this)
  }
}

export { Processing }
