import { Observable, catchError } from 'rxjs';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ValidationException } from '../exceptions/validation.exception';

export function handleRpcError<T>() {
  const logger = new Logger('RpcErrorHandler');
  return (source: Observable<T>): Observable<T> => {
    return source.pipe(
      catchError((error) => {
        logger.debug('Error caught in RPC transform:', error);

        // Handle validation errors
        if ('error' in error && error['error'].name === 'ValidationError') {
          Logger.debug('VALIDATION ERROR', error, 'RpcErrorHandler');
          const { error: validationError } = error;
          const validationErrors = Object.values(validationError.errors).map(
            (err: { path: string; message: string }) => ({
              field: err.path,
              message: err.message,
            }),
          );

          throw new ValidationException(validationErrors);
        }

        if (error.isRpcException) {
          logger.debug('ERROR.ISRpcEXCEPTION:');
          // Forward the RPC exception details
          throw new HttpException(
            error.error,
            error.error.status || HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        // For other types of errors
        console.error('Unexpected error', error);
        throw new HttpException(
          {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'An unexpected error occurred',
            error: 'Internal Server Error',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }),
    );
  };
}
