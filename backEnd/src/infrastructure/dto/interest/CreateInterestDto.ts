import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';

export class CreateInterestDto {
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
