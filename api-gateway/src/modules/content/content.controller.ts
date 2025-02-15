import {
  Body,
  Controller,
  Inject,
  Post,
  Get,
  Query,
  Param,
  Put,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { CreateContentDto, UpdateContentDto, QueryContentDto } from '@story-pull/types';

import { handleRpcError } from '../../utils/operators/rpc-error-handler.operator';
import { JwtAuthGuard } from '../../shared/guards/jwt.auth.guard';
import { UserId } from '../../shared/decorators/userId.decorator';

@UseGuards(JwtAuthGuard)
@Controller('api/content')
export class ContentController {
  constructor(@Inject('CONTENT_SERVICE') private readonly contentClient: ClientProxy) {}

  @Post('create-content')
  register(@Body() registerDto: CreateContentDto, @UserId() userId: string): Observable<unknown> {
    console.log('USER:', userId);

    return this.contentClient
      .send(
        { cmd: 'createContent' },
        {
          data: registerDto,
          userId, // Pass the authenticated user from JwtAuthGuard
        },
      )
      .pipe(handleRpcError());
  }

  @Get()
  getPaginatedContent(
    @Query() queryContentDto: QueryContentDto,
    @UserId() userId: string,
  ): Observable<unknown> {
    return this.contentClient
      .send(
        { cmd: 'findAllContent' },
        {
          data: queryContentDto,
          userId,
        },
      )
      .pipe(handleRpcError());
  }

  @Get(':id')
  getContentById(@Param('id') id: string, @UserId() userId: string): Observable<unknown> {
    console.log('CONTENT ID:', id);

    return this.contentClient
      .send({ cmd: 'findContentById' }, { id, userId })
      .pipe(handleRpcError());
  }

  @Put(':id')
  updateContent(
    @Param('id') id: string,
    @Body() updateDto: UpdateContentDto,
    @UserId() userId: string,
  ): Observable<unknown> {
    console.log('CONTENT ID:', id);
    console.log('UPDATE DTO:', updateDto);

    return this.contentClient
      .send({ cmd: 'updateContent' }, { id, data: updateDto, userId })
      .pipe(handleRpcError());
  }

  @Patch(':id/type')
  updateType(
    @Param('id') id: string,
    @Body('type') type: string,
    @UserId() userId: string,
  ): Observable<unknown> {
    console.log('CONTENT ID:', id);
    console.log('UPDATE TYPE:', type);

    return this.contentClient
      .send({ cmd: 'updateType' }, { id, data: { type }, userId })
      .pipe(handleRpcError());
  }
}
