import { ArgumentMetadata, PipeTransform } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

export class QueryValidationPipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: Record<string, number>, metadata: ArgumentMetadata) {
    if (value.dateFrom && value.dateTo && value.dateFrom > value.dateTo) {
      throw new RpcException({
        status: 400,
        message: 'dateFrom cannot be later than dateTo',
        name: 'QueryValidationError',
      });
    }

    return value;
  }
}
