import { Observable, catchError } from 'rxjs';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ValidationException } from '../exceptions/validation.exception';

export function handleRpcError<T>() {
  return (source: Observable<T>): Observable<T> => {
    return source.pipe(
      catchError((error) => {
        if (error.isRpcException) {
          // Forward the RPC exception details
          throw new HttpException(
            error.error,
            error.error.status || HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
          Logger.debug('VALIDATION ERROR', error, 'RpcErrorHandler');
          const validationErrors = Object.values(error.errors).map(
            (err: { path: string; message: string }) => ({
              field: err.path,
              message: err.message,
            }),
          );

          throw new ValidationException(validationErrors);
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
