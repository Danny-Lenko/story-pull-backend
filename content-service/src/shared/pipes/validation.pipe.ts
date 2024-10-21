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
      const messages = errors.map((err) => {
        return `${err.property}: ${Object.values(err.constraints).join(', ')}`;
      });
      throw new RpcException(messages);
    }
    return value;
  }

  private toValidate(metatype: new (...args: unknown[]) => unknown): boolean {
    const types: (new (...args: unknown[]) => unknown)[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
