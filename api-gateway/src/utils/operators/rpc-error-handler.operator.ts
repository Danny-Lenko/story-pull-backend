import { Observable, catchError } from 'rxjs';
import { HttpException, HttpStatus } from '@nestjs/common';

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
        // For other types of errors, log them and return a generic error
        console.error('Unexpected error', error);
        throw new HttpException('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
      }),
    );
  };
}
