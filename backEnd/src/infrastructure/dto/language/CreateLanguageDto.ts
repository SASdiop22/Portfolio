import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';

export class CreateLanguageDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  level!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
