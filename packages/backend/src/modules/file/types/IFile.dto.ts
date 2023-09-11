import { File } from '../entities/file.entity'

export type ICreateFileDTO = Omit<
  File,
  'id' | 'created_at' | 'updated_at' | 'toJSON' | 'dataset'
>

export type IFindFileDTO = Pick<File, 'id'>
