import { PipeTransform, Injectable, ArgumentMetadata, Logger } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ValidationPipe implements PipeTransform<unknown> {
  private readonly logger = new Logger(ValidationPipe.name);

  async transform(value: object, { metatype }: ArgumentMetadata) {
    this.logger.debug(`ValidationPipe.transform called with metatype: ${metatype?.name}`);

    const objectToValidate =
      (value as Record<string, Record<string, string | number>>).data || value;

    if (!metatype || !this.toValidate(metatype)) {
      this.logger.debug(`No validation needed for ${metatype ? metatype.name : 'primitive type'}`);
      return value;
    }
    const object = plainToClass(metatype, objectToValidate);
    this.logger.debug(`Validating object: ${JSON.stringify(object)}`);
    const errors = await validate(object);
    if (errors.length > 0) {
      // Transform errors to match ValidationException format
      const formattedErrors = errors.map((err) => ({
        field: err.property,
        message: Object.values(err.constraints || {}).join(', '),
      }));

      // Throw RpcException with the formatted error structure
      throw new RpcException({
        name: 'ValidationError',
        statusCode: 400,
        message: 'Validation failed',
        error: 'Bad Request',
        errors: formattedErrors,
      });
    }
    return value;
  }

  private toValidate(metatype: new (...args: unknown[]) => unknown): boolean {
    const types: (new (...args: unknown[]) => unknown)[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
