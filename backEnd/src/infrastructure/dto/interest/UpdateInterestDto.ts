import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';

export class UpdateInterestDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
