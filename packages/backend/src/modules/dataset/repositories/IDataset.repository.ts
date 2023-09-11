import { Dataset } from '../entities/dataset.entity'
import { ICreateDatasetDTO, IFindDatasetDTO } from '../types/IDataset.dto'

export interface IDatasetRepository {
  create(data: ICreateDatasetDTO): Promise<Dataset>
  findOne(filter: IFindDatasetDTO): Promise<Dataset | null>
  findMany(filter: IFindDatasetDTO): Promise<Dataset[]>
  updateOne(
    filter: IFindDatasetDTO,
    data: ICreateDatasetDTO,
  ): Promise<Dataset | null>
  deleteOne(filter: IFindDatasetDTO): Promise<Dataset | null>
}
