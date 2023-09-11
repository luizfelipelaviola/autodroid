import { IsNotEmpty, IsString } from 'class-validator'

class UserDatasetUpdateSchema {
  @IsNotEmpty()
  @IsString()
  description: string
}

export { UserDatasetUpdateSchema }
