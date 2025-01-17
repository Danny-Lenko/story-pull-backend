import { IsOptional, ValidateNested, IsDate, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseContentDto, SEODataDto } from './base.dto';

export class CreateContentDto extends BaseContentDto {
  @ValidateNested()
  @Type(() => SEODataDto)
  @IsOptional()
  seo?: SEODataDto;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  publishedAt?: Date;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Version cannot be negative' })
  version?: number;
}
