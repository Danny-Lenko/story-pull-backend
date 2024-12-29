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
  MaxLength,
  ValidationArguments,
} from 'class-validator';
import { Type } from 'class-transformer';

import { IsDateRangeValid } from '../utils';
import { contentStatuses, contentTypes } from './base.dto';

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
  @IsEnum(contentTypes, {
    message: (args: ValidationArguments) =>
      `${args.value} is not a valid type. Type must be one of: ${contentTypes.join(', ')}`,
  })
  type?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(contentStatuses, {
    each: true,
    message: 'Each status must be one of: draft, published, archived',
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

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(10, { message: 'You can specify a maximum of 10 tags' })
  tags?: string[];

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateFrom?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @IsDateRangeValid('dateFrom', 'dateFrom must be earlier than or equal to dateTo')
  dateTo?: Date;
}
