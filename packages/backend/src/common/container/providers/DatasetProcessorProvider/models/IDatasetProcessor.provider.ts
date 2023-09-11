import {
  IProcessDatasetDTO,
  IValidateProcessorParamsDTO,
} from '../types/IDatasetProcessor.dto'
import { Processing } from '@modules/processing/entities/processing.entity'

export interface IDatasetProcessorProvider {
  readonly initialization: Promise<void>

  processDataset(params: IProcessDatasetDTO): Promise<Processing>
  validateProcessorParams(params: IValidateProcessorParamsDTO): Promise<void>

  getAcceptedMimeTypes(): string[]
}
