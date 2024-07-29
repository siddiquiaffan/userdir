import { IsOptional, IsString, IsInt, Min } from 'class-validator';

export class SearchUserDto {
  @IsString()
  readonly userId: string;

  @IsString()
  @IsOptional()
  readonly username?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  readonly minAge?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  readonly maxAge?: number;
}
