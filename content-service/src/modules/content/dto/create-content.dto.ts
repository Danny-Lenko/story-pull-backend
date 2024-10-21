import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
  IsObject,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

class SEOData {
  @IsOptional()
  @IsString()
  @MaxLength(60) // Common max length for SEO titles
  metaTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160) // Common max length for SEO descriptions
  metaDescription?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2083) // Maximum length of a URL in Internet Explorer
  canonicalUrl?: string;
}

export class CreateContentDto {
  @IsString()
  @MinLength(3, { message: 'Title must be longer' })
  @MaxLength(255) // Set a maximum length for the title
  title: string;

  @IsString()
  @MinLength(3)
  @MaxLength(50000) // Set a reasonable maximum length for the body
  body: string;

  @IsEnum(['article', 'page', 'blog_post'], {
    message: 'type must be one of the following values: article, page, blog_post',
  })
  type: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100) // Set a maximum length for the author name
  author: string;

  @IsEnum(['draft', 'published', 'archived'], {
    message: 'status must be one of the following values: draft, published, archived',
  })
  @IsOptional()
  status?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ValidateNested()
  @Type(() => SEOData)
  @IsOptional()
  seo?: SEOData;
}
