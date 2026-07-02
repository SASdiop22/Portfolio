import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class UpdateUserProfileDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  firstName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  lastName?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  desiredPosition?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  tagline?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  mobility?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  ctaTitle?: string;

  @IsOptional()
  @IsString()
  ctaText?: string;
}
