export type IProcessorParams = Record<string, string>

export type IProcessDatasetDTO = {
  processing_id: string
}

export type IValidateProcessorParamsDTO = {
  processor: string
  params: IProcessorParams
}

export type IProcessor = {
  name: string
  code: string
  image: string
  input_arg: string
  input_dir: string
  output_arg: string
  output_dir: string
  command: string
  allowed_params: string[]
  default_params: IProcessorParams
}
