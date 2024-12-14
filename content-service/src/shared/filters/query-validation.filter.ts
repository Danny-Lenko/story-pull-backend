import { ArgumentMetadata, BadRequestException, PipeTransform } from '@nestjs/common';

export class QueryValidationPipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: Record<string, number>, metadata: ArgumentMetadata) {
    if (value.page && (isNaN(value.page) || value.page < 1)) {
      throw new BadRequestException('Page must be a positive number');
    }

    if (value.limit && (isNaN(value.limit) || value.limit < 1 || value.limit > 100)) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }

    if (value.dateFrom && value.dateTo && value.dateFrom > value.dateTo) {
      throw new BadRequestException('dateFrom cannot be later than dateTo');
    }

    return value;
  }
}
