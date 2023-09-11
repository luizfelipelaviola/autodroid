import { STORAGE_PROVIDER } from '@modules/file/types/storageProvider.enum'
import {
  IListFilesByDestinationDTO,
  IRemoveDirectoryByDestinationDTO,
  IRemoveFileByNameDTO,
} from '../types/IRemoveFile.dto'
import {
  IUploadFileFromRequestDTO,
  IUploadFileFromRequestResponseDTO,
} from '../types/IUploadFile.dto'

export interface IStorageProvider {
  readonly provider_code: STORAGE_PROVIDER
  readonly initialization: Promise<void>

  uploadFiles(
    params: IUploadFileFromRequestDTO,
  ): Promise<IUploadFileFromRequestResponseDTO>

  listFilesByDestination(params: IListFilesByDestinationDTO): Promise<string[]>

  removeFileByName(params: IRemoveFileByNameDTO): Promise<string>
  removeDirectoryByDestination(
    params: IRemoveDirectoryByDestinationDTO,
  ): Promise<string>
}
