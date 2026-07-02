import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max } from 'class-validator';

export class UpdateSkillDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  category?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  level?: number;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
