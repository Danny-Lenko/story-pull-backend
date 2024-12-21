import {
  IsEnum,
  IsOptional,
  IsString,
  IsArray,
  MaxLength,
  IsNotEmpty,
  MinLength,
  Matches,
} from 'class-validator';

export class UpdateContentDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  @MaxLength(255, { message: 'Title cannot be longer than 255 characters' })
  @Matches(/^[^<>]*$/, { message: 'Title cannot contain HTML tags' })
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Body must be at least 3 characters long' })
  @MaxLength(50000, { message: 'Body cannot be longer than 50000 characters' })
  body?: string;

  @IsOptional()
  @IsEnum(['draft', 'published', 'archived'])
  status?: string;

  @IsOptional()
  @IsEnum(['article', 'page', 'blog_post'], {
    message: 'Type must be one of the following values: article, page, blog_post',
  })
  type?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Author name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Author name cannot be longer than 100 characters' })
  @Matches(/^[^<>]*$/, { message: 'Author name cannot contain HTML tags' })
  author?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  metadata?: Record<string, unknown>;
}
