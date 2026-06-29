import { IsString, IsNotEmpty, IsUrl, IsOptional, IsInt, Min } from 'class-validator';

export class CreateSocialLinkDto {
  @IsString()
  @IsNotEmpty()
  platform!: string;

  @IsUrl()
  url!: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
