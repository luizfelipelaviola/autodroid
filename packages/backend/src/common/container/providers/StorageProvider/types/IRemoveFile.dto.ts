export interface IRemoveFileByNameDTO {
  filename: string
  destination: string
}

export interface IRemoveDirectoryByDestinationDTO {
  destination: string
}

export interface IListFilesByDestinationDTO {
  destination: string
}
