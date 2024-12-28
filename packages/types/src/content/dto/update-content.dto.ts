import {
  IsEnum,
  IsOptional,
  IsString,
  IsArray,
  MaxLength,
  IsNotEmpty,
  MinLength,
  Matches,
  ValidationArguments,
} from 'class-validator';

const contentTypes = ['article', 'page', 'blog_post'] as const;
const contentStatuses = ['draft', 'published', 'archived'] as const;

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
  @IsEnum(contentStatuses, {
    message: (args: ValidationArguments) =>
      `${args.value} is not a valid status. Status must be one of the following values: ${contentStatuses.join(', ')}`,
  })
  status?: string;

  @IsOptional()
  @IsEnum(contentTypes, {
    message: (args: ValidationArguments) =>
      `${args.value} is not a valid type. Type must be one of the following values: ${contentTypes.join(', ')}`,
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
