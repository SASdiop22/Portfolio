import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';

export class CreateStrengthDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
