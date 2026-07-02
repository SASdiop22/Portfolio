import { IsString, IsNotEmpty, IsUrl, IsOptional, IsInt, Min } from 'class-validator';

export class UpdateSocialLinkDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  platform?: string;

  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
