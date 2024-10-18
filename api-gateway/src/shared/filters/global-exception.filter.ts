import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Unknown error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      this.logger.error('Exception thrown', exceptionResponse);

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const { message: exceptionMessage, name: exceptionName } = exceptionResponse as {
          message?: string;
          name?: string;
        };
        message = exceptionMessage || message;
        error = exceptionName || error;
      } else {
        message = exceptionResponse.toString();
      }
    }

    response.status(status).json({
      statusCode: status,
      message,
      error,
    });
  }
}
