import { Body, Controller, Inject, Post, Headers } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { handleRpcError } from '../../utils/operators/rpc-error-handler.operator';

@Controller('api/content')
export class ContentController {
  constructor(@Inject('CONTENT_SERVICE') private readonly contentClient: ClientProxy) {}

  @Post('create-content')
  register(
    @Body() registerDto: unknown,
    @Headers('authorization') token: string,
  ): Observable<unknown> {
    return this.contentClient
      .send({ cmd: 'createContent' }, { data: registerDto, metadata: { authorization: token } })
      .pipe(handleRpcError());
  }
}
