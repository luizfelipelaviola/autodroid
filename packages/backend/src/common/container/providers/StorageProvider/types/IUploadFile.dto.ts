import { Request, Response } from 'express'

import { File } from '@modules/file/entities/file.entity'

export type IUploadFileFromRequestDTO = {
  request: Request
  response: Response
  fields: Record<
    string,
    {
      destination: string
      allowedMimeTypes: string[]

      minCount: number
      maxCount: number

      minSizeBytes?: number
      maxSizeBytes?: number
    }
  >
}

export type IStorageFileDTO = Omit<
  File,
  'id' | 'created_at' | 'updated_at' | 'toJSON'
>

export type IUploadFileFromRequestResponseDTO = Record<
  string,
  IStorageFileDTO[]
>
