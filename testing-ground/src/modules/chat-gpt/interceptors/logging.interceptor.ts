/* eslint-disable @typescript-eslint/no-explicit-any */
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log(`Incoming request...`);
    const now = Date.now();
    return next
      .handle()
      .pipe(tap(() => console.log(`Outgoing response... Time: ${Date.now() - now}ms`)));
  }
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<any> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
      })),
      catchError((error) => {
        return of({
          success: false,
          error: error.message || 'An unknown error occurred',
        });
      }),
    );
  }
}
