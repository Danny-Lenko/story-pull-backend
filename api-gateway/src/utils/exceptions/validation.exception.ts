import { HttpException, HttpStatus } from '@nestjs/common';

export class ValidationException extends HttpException {
  constructor(public readonly errors: { field: string; message: string }[]) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Validation failed',
        error: 'Bad Request',
        errors: errors,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
