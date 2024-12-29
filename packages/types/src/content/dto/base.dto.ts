import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  MinLength,
  MaxLength,
  Matches,
  IsObject,
  ArrayMaxSize,
  ValidationArguments,
} from 'class-validator';

// Shared Enums
export const contentTypes = ['article', 'page', 'blog_post'] as const;
export const contentStatuses = ['draft', 'published', 'archived'] as const;

// Base DTO for common content fields
export class BaseContentDto {
  @IsString()
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  @MaxLength(255, { message: 'Title cannot be longer than 255 characters' })
  @Matches(/^[^<>]*$/, { message: 'Title cannot contain HTML tags' })
  title: string;

  @IsString()
  @MinLength(3, { message: 'Body must be at least 3 characters long' })
  @MaxLength(50000, { message: 'Body cannot be longer than 50000 characters' })
  @Matches(/^[^<>]*$/, { message: 'Body cannot contain HTML tags' })
  body: string;

  @IsEnum(contentTypes, {
    message: (args: ValidationArguments) =>
      `${args.value} is not a valid type. Type must be one of: ${contentTypes.join(', ')}`,
  })
  type: string;

  @IsString()
  @MinLength(2, { message: 'Author name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Author name cannot be longer than 100 characters' })
  @Matches(/^[^<>]*$/, { message: 'Author name cannot contain HTML tags' })
  author: string;

  @IsOptional()
  @IsEnum(contentStatuses, {
    message: (args: ValidationArguments) =>
      `${args.value} is not a valid status. Status must be one of: ${contentStatuses.join(', ')}`,
  })
  status?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10, { message: 'Cannot have more than 10 tags' })
  tags?: string[];

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

// DTO for SEO Data
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
  @Matches(/^https?:\/\/.+/, {
    message: 'Canonical URL must be a valid URL starting with http:// or https://',
  })
  canonicalUrl?: string;
}
