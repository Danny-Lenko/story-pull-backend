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

    console.log('EXCEPTION:', exception);

    this.logger.error(`Exception caught: ${JSON.stringify(errorResponse)}`);

    return throwError(() => errorResponse);
  }
}
