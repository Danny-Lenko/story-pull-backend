/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
  RequestTimeoutException,
} from '@nestjs/common';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap, timeout } from 'rxjs/operators';

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

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(_: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(2000),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      catchError((err) => throwError(() => new RequestTimeoutException('Request timed out'))),
    );
  }
}

@Injectable()
export class RateLimiterInterceptor implements NestInterceptor {
  private requestsMap: Map<string, number[]> = new Map();
  private readonly limit = 3;
  private readonly timeframe = 10 * 1000;

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const userIP = request.ip || request.headers['x-forwarded-for'] || 'unknown';

    const now = Date.now();
    const timestamps = this.requestsMap.get(userIP) || [];

    const validTimestamps = timestamps.filter((timestamp) => now - timestamp < this.timeframe);

    if (validTimestamps.length >= this.limit) {
      throw new HttpException('Rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
    }

    validTimestamps.push(now);
    this.requestsMap.set(userIP, validTimestamps);

    return next.handle();
  }
}
