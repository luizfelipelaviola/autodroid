import {
  IsNotEmpty,
  IsObject,
  IsString,
  IsUUID,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'

@ValidatorConstraint({ name: 'isDatasetParams', async: false })
export class IsDatasetParams implements ValidatorConstraintInterface {
  validate(target: Record<string, string>, _: ValidationArguments) {
    if (!target || typeof target !== 'object') return false
    if (Object.keys(target).length === 0) return false
    if (
      Object.entries(target).some(
        ([key, value]) => typeof key !== 'string' || typeof value !== 'string',
      )
    )
      return false
    return true
  }

  defaultMessage(_: ValidationArguments) {
    return 'Params should be an object with key-value string pairs.'
  }
}

class UserProcessingCreateSchema {
  @IsNotEmpty()
  @IsUUID()
  dataset_id: string

  @IsNotEmpty()
  @IsString()
  processor: string

  @IsNotEmpty()
  @IsObject()
  @Validate(IsDatasetParams)
  params: Record<string, string>
}

export { UserProcessingCreateSchema }
