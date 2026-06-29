import { IsString, IsNotEmpty, IsDateString, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';

export class UpdateEducationDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  institution?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  city?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  specialization?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  current?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
