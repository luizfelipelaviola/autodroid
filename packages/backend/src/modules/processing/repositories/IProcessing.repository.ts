import { Processing } from '../entities/processing.entity'
import {
  ICreateProcessingDTO,
  IFindProcessingDTO,
  IUpdateProcessingDTO,
} from '../types/IProcessing.dto'

export interface IProcessingRepository {
  create(data: ICreateProcessingDTO): Promise<Processing>
  findOne(filter: IFindProcessingDTO): Promise<Processing | null>
  findMany(filter: IFindProcessingDTO): Promise<Processing[]>
  updateOne(
    filter: IFindProcessingDTO,
    data: IUpdateProcessingDTO,
  ): Promise<Processing | null>
  deleteOne(filter: IFindProcessingDTO): Promise<Processing | null>
}
