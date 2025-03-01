import { Controller, UseFilters, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  CreateContentDto,
  // UpdateContentDto,
  // QueryContentDto
} from '@story-pull/types';

import { ContentBaseService } from '../services/content-base.service';
import { transformToRpcException } from '../../../utils/operators/rpc-transformer.operator';
import { RpcExceptionFilter } from '../../../shared/filters/rpc-exception.filter';

// ============================ TODO: DEAL WITH userId => creatorId transition where necessary

@Controller('content')
@UseFilters(new RpcExceptionFilter())
export class ContentBaseController {
  constructor(
    private readonly contentService: ContentBaseService,
    private readonly logger: Logger,
  ) {}

  @MessagePattern({ cmd: 'createContent' })
  create(@Payload() message: { data: CreateContentDto; userId: string }) {
    const { data, userId } = message;
    this.logger.log(`Creating new content: ${JSON.stringify(data)}`);
    this.logger.log(`Authenticated user: ${JSON.stringify(userId)}`);
    return this.contentService
      .create({ createContentDto: data, userId })
      .pipe(transformToRpcException());
  }

  //   @MessagePattern({ cmd: 'findAllContent' })
  //   findAll(@Payload() message: { data: QueryContentDto; userId: string }) {
  //     const { data, userId } = message;
  //     this.logger.log(`Finding all content with query: ${JSON.stringify(data)}`);
  //     return this.contentService
  //       .findAllPaginated({ query: data, userId })
  //       .pipe(transformToRpcException());
  //   }

  //   @MessagePattern({ cmd: 'findContentById' })
  //   findById(@Payload() message: { id: string; userId: string }) {
  //     const { id, userId } = message;
  //     this.logger.log(`Finding content with ID: ${id}`);
  //     return this.contentService.findById({ id, userId }).pipe(transformToRpcException());
  //   }

  //   @MessagePattern({ cmd: 'updateContent' })
  //   update(@Payload() { id, data, userId }: { id: string; data: UpdateContentDto; userId: string }) {
  //     this.logger.log(`Updating content with ID: ${id}`);
  //     return this.contentService
  //       .update({ id, updateContentDto: data, userId })
  //       .pipe(transformToRpcException());
  //   }

  //   @MessagePattern({ cmd: 'updateType' })
  //   updateType(
  //     @Payload() { id, data, userId }: { id: string; data: { type: string }; userId: string },
  //   ) {
  //     this.logger.log(`Updating content type with ID: ${id}`);
  //     return this.contentService
  //       .update({ id, updateContentDto: data, userId })
  //       .pipe(transformToRpcException());
  //   }
}
