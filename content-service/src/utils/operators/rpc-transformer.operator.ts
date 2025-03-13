import { RpcException } from '@nestjs/microservices';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { throwError, Observable, catchError } from 'rxjs';

interface RpcExceptionResponse {
  status: number;
  message: string;
  error: string;
  errors?: Record<string, string>[];
}

export function transformToRpcException() {
  return (source: Observable<unknown>): Observable<unknown> => {
    return source.pipe(
      catchError((error) => {
        const logger = new Logger('RpcExceptionTransform');
        logger.error('Error caught in RPC transform:', error);

        let rpcResponse: RpcExceptionResponse;

        // Handle HTTP exceptions
        if (error instanceof HttpException) {
          const response = error.getResponse();
          rpcResponse = {
            status: error.getStatus(),
            message: typeof response === 'string' ? response : response['message'],
            error: error.name,
            errors: response['errors'],
          };
          return throwError(() => new RpcException(rpcResponse));
        }

        // Handle mongoose validation errors
        if (error?.name === 'ValidationError' && error.errors) {
          logger.debug('Mongoose validation error:', error);
          const validationErrors = Object.values(error.errors).map(
            (err: { path: string; message: string }) => ({
              field: err.path,
              message: err.message,
            }),
          );

          rpcResponse = {
            status: HttpStatus.BAD_REQUEST,
            message: 'Validation failed',
            error: 'Bad Request',
            errors: validationErrors,
          };
          return throwError(() => new RpcException(rpcResponse));
        }

        // Hanle RPC exceptions
        if (error instanceof RpcException) return throwError(() => error);

        // Handle generic errors
        if (error instanceof Error) {
          rpcResponse = {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: error.message || 'Internal server error',
            error: error.name || 'InternalServerError',
          };
          return throwError(() => new RpcException(rpcResponse));
        }

        // Handle unknown errors
        rpcResponse = {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'An unexpected error occurred',
          error: 'InternalServerError',
        };

        return throwError(() => new RpcException(rpcResponse));
      }),
    );
  };
}
