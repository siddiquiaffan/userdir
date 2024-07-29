import { IsNotEmpty, IsArray, Min } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Field $property cannot be empty' })
  @Min(4, { message: 'Field $property must be at least 4 characters' })
  name: string;

  @IsNotEmpty({ message: 'Field $property cannot be empty' })
  @Min(4, { message: 'Field $property must be at least 4 characters' })
  surname: string;

  @IsNotEmpty({ message: 'Field $property cannot be empty' })
  @Min(4, { message: 'Field $property must be at least 4 characters' })
  username: string;

  @IsNotEmpty({ message: 'Field $property cannot be empty' })
  birthdate: Date;

  @IsArray({ message: 'Field $property must be an array' })
  blockedUsers: string[];
}
