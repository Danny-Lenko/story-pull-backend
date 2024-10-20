import { Observable, catchError } from 'rxjs';
import { HttpException, HttpStatus } from '@nestjs/common';
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

// import { Observable, catchError } from 'rxjs';
// import { HttpException, HttpStatus } from '@nestjs/common';

// export function handleRpcError<T>() {
//   return (source: Observable<T>): Observable<T> => {
//     return source.pipe(
//       catchError((error) => {
//         if (error.isRpcException) {
//           // Forward the RPC exception details
//           throw new HttpException(
//             error.error,
//             error.error.status || HttpStatus.INTERNAL_SERVER_ERROR,
//           );
//         }

//         // Handle validation errors
//         if (error.name === 'ValidationError') {
//           const validationErrors = Object.values(error.errors).map(
//             (err: { path: string; message: string }) => ({
//               field: err.path,
//               message: err.message,
//             }),
//           );

//           console.log('validationErrors', validationErrors);

//           throw new HttpException(
//             {
//               message: 'Validation failed',
//               errors: validationErrors,
//               error: 'BadRequest',
//             },
//             HttpStatus.BAD_REQUEST,
//           );
//         }

//         // For other types of errors, log them and return a generic error
//         console.error('Unexpected error', error);
//         throw new HttpException(
//           {
//             statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
//             message: 'An unexpected error occurred',
//             error: 'Internal Server Error',
//           },
//           HttpStatus.INTERNAL_SERVER_ERROR,
//         );
//       }),
//     );
//   };
// }

// import { Observable, catchError } from 'rxjs';
// import { HttpException, HttpStatus } from '@nestjs/common';

// export function handleRpcError<T>() {
//   return (source: Observable<T>): Observable<T> => {
//     return source.pipe(
//       catchError((error) => {
//         if (error.isRpcException) {
//           // Forward the RPC exception details
//           throw new HttpException(
//             error.error,
//             error.error.status || HttpStatus.INTERNAL_SERVER_ERROR,
//           );
//         }

//         // Handle validation errors
//         if (error.name === 'ValidationError') {
//           const validationErrors = Object.values(error.errors).map((err: any) => ({
//             field: err.path,
//             message: err.message,
//           }));

//           throw new HttpException(
//             {
//               message: 'Validation failed',
//               errors: validationErrors,
//             },
//             HttpStatus.BAD_REQUEST,
//           );
//         }

//         // For other types of errors, log them and return a generic error
//         console.error('Unexpected error', error);
//         throw new HttpException('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
//       }),
//     );
//   };
// }

// import { Observable, catchError } from 'rxjs';
// import { HttpException, HttpStatus } from '@nestjs/common';

// export function handleRpcError<T>() {
//   return (source: Observable<T>): Observable<T> => {
//     return source.pipe(
//       catchError((error) => {
//         if (error.isRpcException) {
//           // Forward the RPC exception details
//           throw new HttpException(
//             error.error,
//             error.error.status || HttpStatus.INTERNAL_SERVER_ERROR,
//           );
//         }
//         // For other types of errors, log them and return a generic error
//         console.error('Unexpected error', error);
//         throw new HttpException('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
//       }),
//     );
//   };
// }
