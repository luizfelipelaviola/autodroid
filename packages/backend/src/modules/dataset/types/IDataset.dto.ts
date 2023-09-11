import { Dataset } from '../entities/dataset.entity'

export type ICreateDatasetDTO = Omit<
  Dataset,
  | 'id'
  | 'created_at'
  | 'updated_at'
  | 'toJSON'
  | 'file'
  | 'user'
  | 'processings'
> & {
  file_id: string
  user_id: string
}

export type IUpdateDatasetDTO = Omit<ICreateDatasetDTO, 'user_id' | 'file_id'>

export type IFindDatasetDTO = {
  id?: string
  user_id?: string
}
