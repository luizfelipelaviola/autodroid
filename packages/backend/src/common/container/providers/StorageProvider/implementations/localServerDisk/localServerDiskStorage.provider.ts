import fs from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'

import { STORAGE_PROVIDER } from '@modules/file/types/storageProvider.enum'
import { getFileExtension } from '@common/util/getFileExtension'
import { AppError } from '@common/errors/AppError'
import { sleep } from '@common/util/sleep'
import { IStorageProvider } from '../../models/IStorage.provider'
import {
  IStorageFileDTO,
  IUploadFileFromRequestDTO,
  IUploadFileFromRequestResponseDTO,
} from '../../types/IUploadFile.dto'
import {
  IListFilesByDestinationDTO,
  IRemoveDirectoryByDestinationDTO,
  IRemoveFileByNameDTO,
} from '../../types/IRemoveFile.dto'
import { StorageProviderBase } from '../storageProviderBase.provider'
import { inject, injectable } from 'tsyringe'
import { IDatasetProcessorProvider } from '@common/container/providers/DatasetProcessorProvider/models/IDatasetProcessor.provider'

@injectable()
class LocalServerDiskStorageProvider
  extends StorageProviderBase
  implements IStorageProvider
{
  public readonly provider_code = STORAGE_PROVIDER.LOCAL_SERVER_DISK
  public readonly initialization: Promise<void>

  constructor(
    @inject('DatasetProcessorProvider')
    protected readonly datasetProcessorProvider: IDatasetProcessorProvider,
  ) {
    super(datasetProcessorProvider)
    this.initialization = Promise.resolve()
  }

  public async uploadFiles(
    params: IUploadFileFromRequestDTO,
  ): Promise<IUploadFileFromRequestResponseDTO> {
    const requestFiles = await this.uploadFilesFromRequest(params)

    const processedFiles: IUploadFileFromRequestResponseDTO = {}

    try {
      await Promise.all(
        Object.entries(requestFiles).map(async ([key, files]) => {
          processedFiles[key] = processedFiles[key] || []

          if (
            !fs.existsSync(
              path.join(process.cwd(), params.fields[key].destination),
            )
          )
            await promisify(fs.mkdir)(
              path.join(process.cwd(), params.fields[key].destination),
              {
                recursive: true,
              },
            )

          const uploadedFiles = await Promise.all(
            files.map(async (file) => {
              if (!fs.existsSync(file.path))
                throw new AppError({
                  key: '@local_disk_storage_provider/FILE_NOT_FOUND',
                  message: 'Fail to process file.',
                  statusCode: 500,
                })

              const processedFile = {
                destination: params.fields[key].destination,
                storage_provider: STORAGE_PROVIDER.LOCAL_SERVER_DISK,
                filename: file.filename,
                mime_type: file.mimetype,
                extension: getFileExtension(file.filename),
                size: file.size,
                payload: {},
              } as IStorageFileDTO

              processedFiles[key].push(processedFile)

              await promisify(fs.rename)(
                file.path,
                path.join(
                  process.cwd(),
                  processedFile.destination,
                  processedFile.filename,
                ),
              )

              return processedFile
            }),
          )

          return [key, uploadedFiles]
        }),
      )

      return processedFiles
    } catch (err) {
      try {
        await sleep(3000)
        await Promise.all(
          [
            ...Object.values(requestFiles),
            ...Object.values(processedFiles),
          ].map(async (files) => {
            await Promise.all(
              files.map(async (file) => {
                await this.removeFileByName({
                  filename: file.filename,
                  destination: file.destination,
                })
              }),
            )
          }),
        )
      } catch {}

      throw err
    }
  }

  public async listFilesByDestination(
    params: IListFilesByDestinationDTO,
  ): Promise<string[]> {
    const { destination } = params

    const directoryPath = path.join(process.cwd(), destination)

    if (!fs.existsSync(directoryPath)) return []

    const files = await promisify(fs.readdir)(directoryPath, {
      recursive: true,
    })

    return files.map((file) => file.toString())
  }

  public async removeFileByName(params: IRemoveFileByNameDTO): Promise<string> {
    const { filename, destination } = params

    const filePath = path.join(process.cwd(), destination, filename)

    if (!fs.existsSync(filePath)) return filePath

    return new Promise((resolve, reject) => {
      fs.unlink(filePath, (err) => {
        if (err) reject(err)
        else resolve(filePath)
      })
    })
  }

  public async removeDirectoryByDestination(
    params: IRemoveDirectoryByDestinationDTO,
  ): Promise<string> {
    const { destination } = params

    const directoryPath = path.join(process.cwd(), destination)

    if (!fs.existsSync(directoryPath)) return directoryPath

    return new Promise((resolve, reject) => {
      fs.rm(directoryPath, { recursive: true }, (err) => {
        if (err) reject(err)
        else resolve(directoryPath)
      })
    })
  }
}

export { LocalServerDiskStorageProvider }
