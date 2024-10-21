import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ValidationException } from '../../utils/exceptions/validation.exception';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Unknown error';
    let errors = undefined;

    if (exception instanceof ValidationException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as {
        message: string;
        error: string;
        errors?: Record<string, string>[];
      };
      message = exceptionResponse.message;
      error = exceptionResponse.error;
      errors = exceptionResponse.errors;

      this.logger.error('Validation Exception', { message, error, errors });
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      this.logger.error('Exception thrown', exceptionResponse);

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const { message: exceptionMessage, name: exceptionName } = exceptionResponse as {
          message?: string;
          name?: string;
        };
        message = exceptionMessage || message;
        error = exceptionName || exception.name || error;
      } else {
        message = exceptionResponse.toString();
      }
    } else {
      this.logger.error('Unexpected error', exception);
    }

    const responseBody: {
      statusCode: number;
      message: string;
      error: string;
      errors?: Record<string, string>[];
    } = {
      statusCode: status,
      message,
      error,
    };

    if (errors) {
      responseBody.errors = errors;
    }

    response.status(status).json(responseBody);
  }
}
