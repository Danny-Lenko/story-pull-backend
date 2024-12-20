import {
  IsEnum,
  IsNumber,
  IsOptional,
  Max,
  Min,
  IsIn,
  IsString,
  IsArray,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';

export class QueryContentDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'Page must be greater than or equal to 1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'Limit must be greater than or equal to 1' })
  @Max(100, { message: 'Limit must be less than or equal to 100' })
  limit?: number = 10;

  @IsOptional()
  @IsEnum(['article', 'page', 'blog_post'], {
    message: 'Type must be one of: article, page, blog_post',
  })
  type?: string;

  @IsOptional()
  @IsEnum(['draft', 'published', 'archived'], {
    message: 'Status must be one of: draft, published, archived',
  })
  status?: string[];

  @IsOptional()
  @IsIn(['createdAt', 'title', 'publishedAt'], {
    message: 'SortBy must be one of: createdAt, title, publishedAt',
  })
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'], {
    message: 'SortOrder must be either: asc or desc',
  })
  sortOrder?: 'asc' | 'desc' = 'desc';

  // ==================== filterings, added 2024-12-14

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateFrom?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateTo?: Date;
}
