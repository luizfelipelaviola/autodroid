import { Processing } from '../entities/processing.entity'

export type ICreateProcessingDTO = Omit<
  Processing,
  'id' | 'created_at' | 'updated_at' | 'toJSON' | 'dataset'
>

export type IFindProcessingDTO = Partial<
  Pick<Processing, 'id' | 'dataset_id'> & {
    user_id?: string
  }
>

export type IUpdateProcessingDTO = Partial<
  Omit<ICreateProcessingDTO, 'dataset_id' | 'processor'>
>
