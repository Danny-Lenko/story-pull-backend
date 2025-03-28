import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log(`Incoming request...`);
    const now = Date.now();
    return next
      .handle()
      .pipe(tap(() => console.log(`Outgoing response... Time: ${Date.now() - now}ms`)));
  }
}
