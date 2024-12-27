import { PipeTransform, Injectable, ArgumentMetadata, Logger } from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ValidationPipe implements PipeTransform<unknown> {
  private readonly logger = new Logger(ValidationPipe.name);

  async transform(value: object, { metatype }: ArgumentMetadata) {
    this.logger.debug(`ValidationPipe.transform called with metatype: ${metatype?.name}`);

    // const objectToValidate =
    //   (value as Record<string, Record<string, string | number>>).data || value;

    if (!metatype || !this.toValidate(metatype)) {
      this.logger.debug(`No validation needed for ${metatype ? metatype.name : 'primitive type'}`);
      return value;
    }

    let objectToValidate = value;
    if (value && typeof value === 'object' && 'data' in value && value.data) {
      objectToValidate = (value as { data: object }).data;
    }

    const object = plainToClass(metatype, objectToValidate, {
      enableImplicitConversion: true,
      excludeExtraneousValues: false,
    });

    this.logger.debug(`Validating object: ${JSON.stringify(object)}`);
    const errors = await validate(object, {
      whitelist: true, // Only allows defined properties
      forbidNonWhitelisted: true, // Throws errors for undefined properties
      skipMissingProperties: false, // Don't skip validation of missing properties
      validationError: { target: false }, // Don't include the target object in error messages
    });

    if (errors.length > 0) {
      // Transform errors to match ValidationException format
      // const formattedErrors = errors.map((err) => ({
      //   field: err.property,
      //   message: Object.values(err.constraints || {}).join(', '),
      // }));

      const formattedErrors = this.formatErrors(errors);
      this.logger.debug(`Validation errors: ${JSON.stringify(formattedErrors)}`);

      // Throw RpcException with the formatted error structure
      throw new RpcException({
        name: 'ValidationError',
        statusCode: 400,
        message: 'Validation failed',
        error: 'Bad Request',
        errors: formattedErrors,
      });
    }
    // return value;
    return {
      ...value,
      ...('data' in value ? { data: object } : {}),
    };
  }

  private toValidate(metatype: new (...args: unknown[]) => unknown): boolean {
    const types: (new (...args: unknown[]) => unknown)[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private formatErrors(errors: ValidationError[]): Array<{ field: string; message: string }> {
    return errors
      .map((err) => {
        // Handle nested validation errors
        if (err.children && err.children.length > 0) {
          return this.formatErrors(err.children).map((childErr) => ({
            field: `${err.property}.${childErr.field}`,
            message: childErr.message,
          }));
        }

        return {
          field: err.property,
          message: Object.values(err.constraints || {}).join(', '),
        };
      })
      .flat();
  }
}
