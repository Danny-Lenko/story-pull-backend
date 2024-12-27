import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
  IsObject,
  MaxLength,
  MinLength,
  IsUrl,
  IsDate,
  IsNumber,
  Min,
  ArrayMaxSize,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SEODataDto {
  @IsOptional()
  @IsString()
  @MaxLength(60, { message: 'Meta title cannot be longer than 60 characters' })
  metaTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160, { message: 'Meta description cannot be longer than 160 characters' })
  metaDescription?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2083, { message: 'Canonical URL cannot be longer than 2083 characters' })
  @IsUrl(
    {
      protocols: ['http', 'https'],
      require_protocol: true,
    },
    { message: 'Canonical URL must be a valid URL starting with http:// or https://' },
  )
  canonicalUrl?: string;
}

export class CreateContentDto {
  @IsString()
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  @MaxLength(255, { message: 'Title cannot be longer than 255 characters' })
  @Matches(/^[^<>]*$/, { message: 'Title cannot contain HTML tags' })
  title: string;

  @IsString()
  @MinLength(3, { message: 'Body must be at least 3 characters long' })
  @MaxLength(50000, { message: 'Body cannot be longer than 50000 characters' })
  body: string;

  @IsEnum(['article', 'page', 'blog_post'], {
    message: 'Type must be one of the following values: article, page, blog_post',
  })
  type: string;

  @IsString()
  @MinLength(2, { message: 'Author name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Author name cannot be longer than 100 characters' })
  @Matches(/^[^<>]*$/, { message: 'Author name cannot contain HTML tags' })
  author: string;

  @IsEnum(['draft', 'published', 'archived'], {
    message: 'Status must be one of the following values: draft, published, archived',
  })
  @IsOptional()
  status?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;

  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10, { message: 'Cannot have more than 10 tags' })
  @IsOptional()
  tags?: string[];

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
