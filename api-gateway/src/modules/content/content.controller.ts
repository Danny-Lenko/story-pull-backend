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
  Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { CreateContentDto, UpdateContentDto, QueryContentDto } from '@story-pull/types';

import { handleRpcError } from '../../utils/operators/rpc-error-handler.operator';
import { JwtAuthGuard } from 'src/shared/guards/jwt.auth.guard';

@Controller('api/content')
export class ContentController {
  constructor(@Inject('CONTENT_SERVICE') private readonly contentClient: ClientProxy) {}

  @Post('create-content')
  @UseGuards(JwtAuthGuard)
  register(@Body() registerDto: CreateContentDto, @Req() req): Observable<unknown> {
    console.log('USER:', req.user);
    return this.contentClient
      .send(
        { cmd: 'createContent' },
        {
          data: registerDto,
          user: req.user, // Pass the authenticated user from JwtAuthGuard
        },
      )
      .pipe(handleRpcError());
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getPaginatedContent(@Query() queryContentDto: QueryContentDto, @Req() req): Observable<unknown> {
    return this.contentClient
      .send(
        { cmd: 'findAllContent' },
        {
          data: queryContentDto,
          user: req.user,
        },
      )
      .pipe(handleRpcError());
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getContentById(@Param('id') id: string, @Req() req): Observable<unknown> {
    console.log('CONTENT ID:', id);

    return this.contentClient
      .send({ cmd: 'findContentById' }, { id, user: req.user })
      .pipe(handleRpcError());
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  updateContent(
    @Param('id') id: string,
    @Body() updateDto: UpdateContentDto,
    @Req() req,
  ): Observable<unknown> {
    console.log('CONTENT ID:', id);
    console.log('UPDATE DTO:', updateDto);

    return this.contentClient
      .send({ cmd: 'updateContent' }, { id, data: updateDto, user: req.user })
      .pipe(handleRpcError());
  }

  @Patch(':id/type')
  @UseGuards(JwtAuthGuard)
  updateType(@Param('id') id: string, @Body('type') type: string, @Req() req): Observable<unknown> {
    console.log('CONTENT ID:', id);
    console.log('UPDATE TYPE:', type);

    return this.contentClient
      .send({ cmd: 'updateType' }, { id, data: { type }, user: req.user })
      .pipe(handleRpcError());
  }
}
