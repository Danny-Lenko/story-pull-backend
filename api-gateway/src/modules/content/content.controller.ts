import {
  Body,
  Controller,
  Inject,
  Post,
  Headers,
  Get,
  Query,
  Param,
  Put,
  Patch,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { CreateContentDto, UpdateContentDto, QueryContentDto } from '@story-pull/types';

import { handleRpcError } from '../../utils/operators/rpc-error-handler.operator';

@Controller('api/content')
export class ContentController {
  constructor(@Inject('CONTENT_SERVICE') private readonly contentClient: ClientProxy) {}

  @Post('create-content')
  register(
    @Body() registerDto: CreateContentDto,
    @Headers('authorization') token: string,
  ): Observable<unknown> {
    return this.contentClient
      .send({ cmd: 'createContent' }, { data: registerDto, metadata: { authorization: token } })
      .pipe(handleRpcError());
  }

  @Get()
  getPaginatedContent(
    @Query() queryContentDto: QueryContentDto,
    @Headers('authorization') token: string,
  ): Observable<unknown> {
    return this.contentClient
      .send(
        { cmd: 'findAllContent' },
        { data: queryContentDto, metadata: { authorization: token } },
      )
      .pipe(handleRpcError());
  }

  @Get(':id')
  getContentById(
    @Param('id') id: string,
    @Headers('authorization') token: string,
  ): Observable<unknown> {
    console.log('CONTENT ID:', id);

    return this.contentClient
      .send({ cmd: 'findContentById' }, { id, metadata: { authorization: token } })
      .pipe(handleRpcError());
  }

  @Put(':id')
  updateContent(
    @Param('id') id: string,
    @Body() updateDto: UpdateContentDto,
    @Headers('authorization') token: string,
  ): Observable<unknown> {
    console.log('CONTENT ID:', id);
    console.log('UPDATE DTO:', updateDto);

    return this.contentClient
      .send({ cmd: 'updateContent' }, { id, data: updateDto, metadata: { authorization: token } })
      .pipe(handleRpcError());
  }

  @Patch(':id/type')
  updateType(
    @Param('id') id: string,
    @Body('type') type: string,
    @Headers('authorization') token: string,
  ): Observable<unknown> {
    console.log('CONTENT ID:', id);
    console.log('UPDATE TYPE:', type);

    return this.contentClient
      .send({ cmd: 'updateType' }, { id, data: { type }, metadata: { authorization: token } })
      .pipe(handleRpcError());
  }
}
