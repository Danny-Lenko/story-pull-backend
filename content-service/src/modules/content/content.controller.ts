import { Controller, UseFilters, Logger, Inject } from '@nestjs/common';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { CreateContentDto, UpdateContentDto, QueryContentDto } from '@story-pull/types';

import { ContentService } from './content.service';
import { transformToRpcException } from '../../utils/operators/rpc-transformer.operator';
import { RpcExceptionFilter } from '../../shared/filters/rpc-exception.filter';
import { SupabaseUser } from './interfaces/supabase';

@Controller('content')
@UseFilters(new RpcExceptionFilter())
export class ContentController {
  private readonly logger = new Logger(ContentController.name);

  constructor(
    private readonly contentService: ContentService,
    @Inject('AUTH_SERVICE') private authClient: ClientProxy,
  ) {}

  @MessagePattern({ cmd: 'createContent' })
  create(@Payload() message: { data: CreateContentDto; user: SupabaseUser }) {
    const { data, user } = message;
    this.logger.log(`Creating new content: ${JSON.stringify(data)}`);
    this.logger.log(`Authenticated user: ${JSON.stringify(user)}`);
    return this.contentService
      .create({ createContentDto: data, user })
      .pipe(transformToRpcException());
  }

  @MessagePattern({ cmd: 'findAllContent' })
  findAll(@Payload() message: { data: QueryContentDto; user: SupabaseUser }) {
    const { data, user } = message;
    this.logger.log(`Finding all content with query: ${JSON.stringify(data)}`);
    return this.contentService
      .findAllPaginated({ query: data, user })
      .pipe(transformToRpcException());
  }

  @MessagePattern({ cmd: 'findContentById' })
  findById(@Payload() message: { id: string; user: SupabaseUser }) {
    const { id, user } = message;
    this.logger.log(`Finding content with ID: ${id}`);
    return this.contentService.findById({ id, user }).pipe(transformToRpcException());
  }

  @MessagePattern({ cmd: 'updateContent' })
  update(
    @Payload() { id, data, user }: { id: string; data: UpdateContentDto; user: SupabaseUser },
  ) {
    this.logger.log(`Updating content with ID: ${id}`);
    return this.contentService
      .update({ id, updateContentDto: data, user })
      .pipe(transformToRpcException());
  }

  @MessagePattern({ cmd: 'updateType' })
  updateType(
    @Payload() { id, data, user }: { id: string; data: { type: string }; user: SupabaseUser },
  ) {
    this.logger.log(`Updating content type with ID: ${id}`);
    return this.contentService
      .update({ id, updateContentDto: data, user })
      .pipe(transformToRpcException());
  }
}
