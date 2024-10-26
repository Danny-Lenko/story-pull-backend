import { IsEnum, IsNumber, IsOptional, Max, Min, IsIn } from 'class-validator';
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
  status?: string;

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
}

// import { IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
// import { Type } from 'class-transformer';

// export class QueryContentDto {
//   @IsOptional()
//   @IsNumber()
//   @Type(() => Number)
//   @Min(1)
//   @Max(100)
//   limit?: number = 10;

//   @IsOptional()
//   @IsNumber()
//   @Type(() => Number)
//   @Min(1)
//   page?: number = 1;

//   @IsOptional()
//   @IsEnum(['article', 'page', 'blog_post'])
//   type?: string;

//   @IsOptional()
//   @IsEnum(['draft', 'published', 'archived'])
//   status?: string;

//   @IsOptional()
//   @IsString()
//   sortBy?: string = 'createdAt';

//   @IsOptional()
//   @IsEnum(['asc', 'desc'])
//   sortOrder?: 'asc' | 'desc' = 'desc';
// }
