import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import util from 'node:util'
import multer, { Multer, MulterError } from 'multer'
import mime from 'mime-types'

import { AppError } from '@common/errors/AppError'
import { getFileExtension } from '@common/util/getFileExtension'
import { IUploadFileFromRequestDTO } from '../types/IUploadFile.dto'
import { IDatasetProcessorProvider } from '../../DatasetProcessorProvider/models/IDatasetProcessor.provider'

class StorageProviderBase {
  private multerInstance: Multer
  private systemAllowedMimeTypes: string[]

  private tmpFolder = 'storage/tmp'
  private uploadsFolder = 'storage/uploads'

  constructor(
    protected readonly datasetProcessorProvider: IDatasetProcessorProvider,
  ) {
    this.systemAllowedMimeTypes =
      datasetProcessorProvider.getAcceptedMimeTypes()

    this.multerInstance = multer({
      storage: multer.diskStorage({
        destination: (_, __, cb) => cb(null, this.tmpFolder),
        filename: (req, file, cb) => {
          const filename = `${randomUUID()}:${new Date().getTime()}.${getFileExtension(
            file.originalname,
          )}`
          cb(null, filename)
        },
      }),
      fileFilter: (_, file, cb) => {
        if (this.systemAllowedMimeTypes.includes(file.mimetype)) cb(null, true)
        else cb(new Error('Invalid file type'))
      },
      limits: {
        fileSize: 500 * 1024 * 1024, // 500mb
      },
    })
  }

  public async uploadFilesFromRequest(
    params: IUploadFileFromRequestDTO,
  ): Promise<Record<string, Express.Multer.File[]>> {
    const { request, response, fields } = params

    if (!fs.existsSync(this.tmpFolder))
      fs.mkdirSync(this.tmpFolder, { recursive: true })
    if (!fs.existsSync(this.uploadsFolder))
      fs.mkdirSync(this.uploadsFolder, { recursive: true })

    return new Promise((resolve, reject) => {
      try {
        this.multerInstance.fields(
          Object.entries(fields).map(([key, { maxCount }]) => ({
            name: key,
            maxCount,
          })),
        )(request, response, async (err) => {
          try {
            if (err) {
              const error = {
                key: '@storage_provider_upload_file/FILE_UPLOAD_ERROR_GENERIC',
                message: 'Fail to upload.',
              }

              if (err instanceof MulterError)
                switch (err.code) {
                  case 'LIMIT_PART_COUNT':
                    error.key = '@storage_provider_upload_file/LIMIT_PART_COUNT'
                    error.message = 'Too many parts on file.'
                    break

                  case 'LIMIT_FILE_SIZE':
                    error.key = '@storage_provider_upload_file/LIMIT_FILE_SIZE'
                    error.message = 'File too large.'
                    break

                  case 'LIMIT_FILE_COUNT':
                    error.key = '@storage_provider_upload_file/LIMIT_FILE_COUNT'
                    error.message = 'Too many files.'
                    break

                  case 'LIMIT_FIELD_KEY':
                    error.key = '@storage_provider_upload_file/LIMIT_FIELD_KEY'
                    error.message = 'Field name too long.'
                    break

                  case 'LIMIT_FIELD_VALUE':
                    error.key =
                      '@storage_provider_upload_file/LIMIT_FIELD_VALUE'
                    error.message = 'Field value too long.'
                    break

                  case 'LIMIT_FIELD_COUNT':
                    error.key =
                      '@storage_provider_upload_file/LIMIT_FIELD_COUNT'
                    error.message = 'Too many fields.'
                    break

                  case 'LIMIT_UNEXPECTED_FILE':
                    error.key =
                      '@storage_provider_upload_file/LIMIT_UNEXPECTED_FILE'
                    error.message = 'Unexpected field.'
                    break

                  default:
                }

              throw new AppError({
                key: error.key,
                message: error.message,
                statusCode: 400,
              })
            }

            if (!request.files || typeof request.files !== 'object')
              throw new AppError({
                key: '@storage_provider_upload_file/NO_FILE_UPLOADED',
                message: 'No file uploaded.',
                statusCode: 400,
              })

            const files = await Object.entries(request.files).reduce<
              Promise<Record<string, Express.Multer.File[]>>
            >(async (total, [key, fieldFiles]) => {
              if (!Array.isArray(fieldFiles))
                throw new AppError({
                  key: '@storage_provider_upload_file/PATH_NOT_FOUND',
                  message: 'File path not found.',
                })

              const fieldConfig = fields[key]

              if (
                !fieldConfig ||
                !Array.isArray(fieldConfig.allowedMimeTypes) ||
                !fieldConfig.allowedMimeTypes.length ||
                typeof fieldConfig.minCount !== 'number' ||
                typeof fieldConfig.maxCount !== 'number'
              )
                throw new AppError({
                  key: '@storage_provider_upload_file/INVALID_FIELD_CONFIG',
                  message: 'Invalid field config.',
                  statusCode: 500,
                  debug: fieldConfig,
                })

              const {
                allowedMimeTypes,
                minSizeBytes,
                maxSizeBytes,
                minCount,
                maxCount,
              } = fieldConfig

              const allowedExtensions = allowedMimeTypes.map((mimeType) =>
                mime.extension(mimeType),
              )

              if (allowedExtensions.some((extension) => !extension))
                throw new AppError({
                  key: '@storage_provider_upload_file/INVALID_EXTENSION_CONFIGURATION',
                  message: 'Invalid mimetype configuration on server.',
                  statusCode: 500,
                  debug: {
                    allowed_mime_types: allowedMimeTypes,
                  },
                })

              if (fieldFiles.length < minCount)
                throw new AppError({
                  key: '@storage_provider_upload_file/NOT_ENOUGH_FILES',
                  message: 'Not enough files.',
                  statusCode: 400,
                })

              if (fieldFiles.length > maxCount)
                throw new AppError({
                  key: '@storage_provider_upload_file/TOO_MANY_FILES',
                  message: 'Too many files.',
                  statusCode: 400,
                })

              return total.then(async (totalFiles) => {
                const result = totalFiles
                result[key] = await Promise.all(
                  fieldFiles.map(async (file: Express.Multer.File) => {
                    if (
                      !allowedMimeTypes.includes(file.mimetype) ||
                      !mime.extension(file.mimetype)
                    )
                      throw new AppError({
                        key: '@storage_provider_upload_file/NOT_ALLOWED_MIME_TYPE',
                        message: 'Invalid file type.',
                        statusCode: 400,
                      })

                    if (file.size <= 0)
                      throw new AppError({
                        key: '@storage_provider_upload_file/EMPTY_FILE',
                        message: 'Empty file sent.',
                        statusCode: 400,
                      })

                    if (
                      typeof minSizeBytes === 'number' &&
                      file.size < minSizeBytes
                    )
                      throw new AppError({
                        key: '@storage_provider_upload_file/FILE_TOO_SMALL',
                        message: 'File too small.',
                        statusCode: 400,
                      })

                    if (
                      typeof maxSizeBytes === 'number' &&
                      file.size > maxSizeBytes
                    )
                      throw new AppError({
                        key: '@storage_provider_upload_file/FILE_TOO_BIG',
                        message: 'File too big.',
                        statusCode: 400,
                      })

                    return {
                      ...file,
                      extension: getFileExtension(file.originalname),
                    }
                  }),
                )
                return result
              })
            }, Promise.resolve({}))

            resolve(files)
          } catch (error) {
            try {
              if (
                request.file &&
                request.file.path &&
                fs.existsSync(request.file.path)
              )
                await util.promisify(fs.unlink)(request.file.path)

              if (request.files && typeof request.files === 'object')
                await Promise.all(
                  Object.entries(request.files).map(([, files]) => {
                    if (Array.isArray(files))
                      return Promise.all(
                        files.map(async (file) => {
                          if (file.path && fs.existsSync(file.path))
                            return util.promisify(fs.unlink)(file.path)
                          return Promise.resolve()
                        }),
                      )
                    return []
                  }),
                )
            } catch {}

            if (error instanceof AppError) {
              reject(error)
              return
            }

            reject(
              new AppError({
                key: '@storage_provider_upload_file/FATAL_FAILURE',
                message: 'Fatal failure while uploading files.',
                statusCode: 500,
                debug: {
                  error,
                },
              }),
            )
          }
        })
      } catch (err) {
        if (err instanceof AppError) reject(err)

        reject(
          new AppError({
            key: '@storage_provider_upload_file/FATAL_FAILURE',
            message: 'Fatal failure while uploading files.',
            statusCode: 400,
          }),
        )
      }
    })
  }
}

export { StorageProviderBase }
