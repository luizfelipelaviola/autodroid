import os from 'node:os'
import fs from 'node:fs'
import Docker from 'dockerode'
import { inject, injectable } from 'tsyringe'

import { IDatasetProcessorProvider } from '../models/IDatasetProcessor.provider'
import { executeAction } from '@common/util/executeAction'
import {
  IProcessDatasetDTO,
  IProcessor,
  IValidateProcessorParamsDTO,
} from '../types/IDatasetProcessor.dto'
import processors from '@/shared/processors.json'
import { AppError } from '@common/errors/AppError'
import { Processing } from '@modules/processing/entities/processing.entity'
import { IInMemoryDatabaseProvider } from '../../InMemoryDatabaseProvider/models/IInMemoryDatabase.provider'
import { IProcessingRepository } from '@common/container/repositories'
import { PROCESSING_STATUS } from '@modules/processing/types/processingStatus.enum'
import { sleep } from '@common/util/sleep'

@injectable()
class DockerDatasetProcessorProvider implements IDatasetProcessorProvider {
  private client: Docker
  public readonly initialization: Promise<void>

  constructor(
    @inject('InMemoryDatabaseProvider')
    private readonly inMemoryDatabaseProvider: IInMemoryDatabaseProvider,

    @inject('ProcessingRepository')
    private readonly processingRepository: IProcessingRepository,
  ) {
    this.initialization = executeAction({
      action: () => this.init(),
      actionName: 'Docker dataset processor provider connection',
      logging: true,
      maxAttempts: 0,
    })
  }

  private async init(): Promise<void> {
    this.client = new Docker(
      fs.existsSync('/var/run/docker.sock')
        ? {
            socketPath: '/var/run/docker.sock',
          }
        : {
            host: process.env.DOCKER_HOST,
            port: Number(process.env.DOCKER_PORT),
          },
    )

    await sleep(1000)

    await this.client.ping()

    await Promise.all(
      Array.from(processors).map((processor) => this.initProcessor(processor)),
    )
  }

  private async initProcessor(processor: IProcessor): Promise<void> {
    const { image } = processor

    this.validateProcessorParams({
      params: processor.default_params,
      processor: processor.code,
    })

    return this.pullImage(image)
  }

  private async checkIfImageExists(image: string): Promise<boolean> {
    const existingImageList = await this.client.listImages()
    return existingImageList.some(
      (existingImage) => existingImage.RepoTags?.includes(image),
    )
  }

  private async pullImage(image: string): Promise<void> {
    try {
      await new Promise((resolve, reject) => {
        console.log(`🔃 Pulling image ${image}...`)

        this.client.pull(image, (err: any, stream: any) => {
          if (err) reject(err)

          this.client.modem.followProgress(stream, onFinished, onProgress)

          function onFinished(err: any, output: any) {
            if (err) return reject(err)

            console.log(`\n🆗 Image ${image} pulled successfully.`)
            return resolve(output)
          }

          function onProgress(event: any) {
            console.log(
              `🔃 Pulling ${image} - ${event.status || ''} ${
                event.progress || ''
              }`,
            )
          }
        })
      })

      await sleep(5000)

      const exists = await this.checkIfImageExists(image)

      if (!exists)
        throw new AppError({
          key: '@dataset_processor/IMAGE_NOT_FOUND',
          message: `Image ${image} not found.`,
        })
    } catch (err: any) {
      console.log(`❌ Error pulling image ${image}: ${err?.message}`)
      throw new Error()
    }
  }

  private getProcessor(processor_code: string): IProcessor {
    const selectedProcessor = processors.find(
      (processor) => processor.code === processor_code,
    )

    if (!selectedProcessor)
      throw new AppError({
        key: '@dataset_processor/INVALID_PROCESSOR',
        message: `Invalid processor. Current processors are: ${processors
          .map((processor) => processor.code)
          .join(', ')}`,
      })

    return selectedProcessor
  }

  public getAcceptedMimeTypes(): string[] {
    return Object.values(processors).flatMap(
      (processor) => processor.allowed_mime_types,
    )
  }

  public async validateProcessorParams({
    params,
    processor,
  }: IValidateProcessorParamsDTO): Promise<void> {
    const selectedProcessor = this.getProcessor(processor)

    if (
      Object.keys(params).some(
        (param) => !selectedProcessor.allowed_params.includes(param),
      )
    )
      throw new AppError({
        key: '@dataset_processor/INVALID_PARAMS',
        message: `Invalid processor ${processor} params. Current params are: ${selectedProcessor.allowed_params.join(
          ', ',
        )}`,
      })
  }

  private async getContainerInfo(
    containerId: string,
  ): Promise<Docker.Container | null> {
    try {
      const containerList = await this.client.listContainers({
        all: true,
      })
      const exists = containerList.find(
        (container) => container.Id === containerId,
      )
      if (exists) {
        const container = this.client.getContainer(containerId)
        return container
      }
    } catch {
      throw new AppError({
        key: '@dataset_processor/FAIL_TO_GET_CONTAINER',
        message: `Container ${containerId} is not running.`,
        statusCode: 500,
      })
    }

    return null
  }

  private async removeContainer(processing: Processing): Promise<void> {
    const processKey = `processing:${processing.id}`
    const processContainerId =
      await this.inMemoryDatabaseProvider.connection.get(processKey)

    if (processContainerId) {
      const container = await this.getContainerInfo(processContainerId)
      if (container) {
        const containerInfo = await container.inspect()
        if (containerInfo.State.Running) await container.stop()
        await container.remove({
          force: true,
          v: true,
        })
      }
    }

    await this.inMemoryDatabaseProvider.connection.del(processKey)
  }

  public async processDataset({
    processing_id,
  }: IProcessDatasetDTO): Promise<Processing> {
    const processingRecord = await this.processingRepository.findOne({
      id: processing_id,
    })
    if (!processingRecord)
      throw new AppError({
        key: '@dataset_processor/PROCESSING_NOT_FOUND',
        message: `Processing ${processing_id} not found.`,
      })

    const { dataset, params, processor } = processingRecord
    const selectedProcessor = this.getProcessor(processor)
    this.validateProcessorParams({
      params,
      processor,
    })

    const imageExists = await this.checkIfImageExists(selectedProcessor.image)
    if (!imageExists) await this.pullImage(selectedProcessor.image)

    const processKey = `processing:${processingRecord.id}`
    const processContainerId =
      await this.inMemoryDatabaseProvider.connection.get(processKey)

    if (processContainerId) {
      await this.processExecutionStatus(processingRecord)
      const updatedProcessing = await this.processingRepository.findOne({
        id: processingRecord.id,
      })

      if (!updatedProcessing)
        throw new AppError({
          key: '@dataset_processor/PROCESSING_NOT_FOUND_AFTER_UPDATE_SUCCESS',
          message: `Processing ${processingRecord.id} not found.`,
          statusCode: 500,
        })

      return updatedProcessing
    }

    const containerArgs = {
      ...selectedProcessor.default_params,
      ...params,
      [selectedProcessor.input_arg]: `${selectedProcessor.input_dir}/${dataset.file.filename}`,
      [selectedProcessor.output_arg]: selectedProcessor.output_dir,
    }

    try {
      const uid = os.userInfo().uid

      const container = await this.client.createContainer({
        Image: selectedProcessor.image,
        Cmd: [
          selectedProcessor.command,
          uid.toString(),
          ...Object.entries(containerArgs).flatMap(([key, value]) => [
            `--${key}`,
            value,
          ]),
        ],
        HostConfig: {
          Binds: [
            `${process.cwd()}/${dataset.file.destination}:${
              selectedProcessor.input_dir
            }:rw`,
            `${process.cwd()}/${processingRecord.destination}/${
              processingRecord.id
            }:${selectedProcessor.output_dir}:rw`,
          ],
        },
      })

      await container.start()

      await this.inMemoryDatabaseProvider.connection.set(
        processKey,
        container.id,
      )

      const updatedProcessing = await this.processingRepository.updateOne(
        {
          id: processingRecord.id,
        },
        {
          retries: processingRecord.retries + 1,
          status: PROCESSING_STATUS.PROCESSING,
          status_description: 'Processing',
          finished_at: null,
        },
      )

      if (!updatedProcessing)
        throw new AppError({
          key: '@dataset_processor/PROCESSING_NOT_FOUND_AFTER_UPDATE_SUCCESS',
          message: `Processing ${processingRecord.id} not found.`,
          statusCode: 500,
        })

      return updatedProcessing
    } catch (error) {
      const updatedProcessing = await this.processingRepository.updateOne(
        {
          id: processingRecord.id,
        },
        {
          status: PROCESSING_STATUS.FAILED,
          status_description: 'Error',
          finished_at: new Date(),
        },
      )

      if (!updatedProcessing)
        throw new AppError({
          key: '@dataset_processor/PROCESSING_NOT_FOUND_AFTER_UPDATE_ERROR',
          message: `Processing ${processingRecord.id} not found.`,
          statusCode: 500,
        })

      return updatedProcessing
    }
  }

  private async processExecutionStatus(
    processing: Processing,
  ): Promise<Processing | null> {
    const processKey = `processing:${processing.id}`
    const processContainerId =
      await this.inMemoryDatabaseProvider.connection.get(processKey)

    const processingRecord = await this.processingRepository.findOne({
      id: processing.id,
    })

    try {
      if (!processingRecord)
        throw new AppError({
          key: '@dataset_processor/PROCESSING_NOT_FOUND',
          message: `Processing ${processing.id} not found.`,
          statusCode: 500,
        })

      if (!processContainerId)
        throw new AppError({
          key: '@dataset_processor/PROCESSING_CONTAINER_NOT_FOUND',
          message: `Processing container ${processing.id} not found.`,
          statusCode: 500,
        })

      const container = await this.getContainerInfo(processContainerId)

      if (!container)
        throw new AppError({
          key: '@dataset_processor/PROCESSING_CONTAINER_INFO_NOT_FOUND',
          message: `Processing container info ${processing.id} not found.`,
          statusCode: 500,
        })

      const containerInfo = await container.inspect()

      const updatedProcessing = await this.processingRepository.updateOne(
        {
          id: processingRecord.id,
        },
        {
          started_at: processingRecord.started_at || new Date(),
          status: containerInfo.State.Running
            ? PROCESSING_STATUS.PROCESSING
            : containerInfo.State.ExitCode === 0
            ? PROCESSING_STATUS.SUCCEEDED
            : PROCESSING_STATUS.FAILED,
          status_description: containerInfo.State.Running
            ? 'Processing'
            : containerInfo.State.ExitCode === 0
            ? 'Succeeded'
            : 'Failed',
          finished_at: containerInfo.State.Running ? null : new Date(),
        },
      )

      if (!containerInfo.State.Running) await this.removeContainer(processing)

      return updatedProcessing
    } catch (err) {
      await this.removeContainer(processing)

      if (
        processingRecord &&
        processingRecord.status !== PROCESSING_STATUS.SUCCEEDED
      )
        return this.processingRepository.updateOne(
          {
            id: processingRecord.id,
          },
          {
            status: PROCESSING_STATUS.FAILED,
            status_description: `Failed/Stalled: ${
              (err as Error)?.message || ''
            }}`,
            finished_at: new Date(),
          },
        )

      return processingRecord
    }
  }
}

export { DockerDatasetProcessorProvider }
