import { File } from '../entities/file.entity'
import { ICreateFileDTO, IFindFileDTO } from '../types/IFile.dto'

export interface IFileRepository {
  create(data: ICreateFileDTO): Promise<File>
  findOne(filter: IFindFileDTO): Promise<File | null>
  deleteOne(filter: IFindFileDTO): Promise<File | null>
}
