import { IsString, IsNotEmpty, IsDateString, IsOptional, IsBoolean, IsInt, Min, IsUrl } from 'class-validator';

export class UpdateExperienceDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  company?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  position?: string;

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
  @IsUrl()
  link?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
