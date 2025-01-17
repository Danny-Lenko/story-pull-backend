import {
  Catch,
  RpcExceptionFilter as NestRpcExceptionFilter,
  ArgumentsHost,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Catch(RpcException)
export class RpcExceptionFilter implements NestRpcExceptionFilter<RpcException> {
  private readonly logger = new Logger(RpcExceptionFilter.name);

  catch(
    exception: RpcException,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    host: ArgumentsHost,
  ): Observable<unknown> {
    const errorResponse = exception.getError();

    this.logger.error(`Exception caught: ${JSON.stringify(errorResponse)}`);

    if (errorResponse instanceof Object && 'isRpcException' in errorResponse)
      return throwError(() => errorResponse);

    return throwError(() => ({
      error: errorResponse,
      isRpcException: true,
    }));
  }
}
