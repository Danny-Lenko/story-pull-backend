import { Controller, UseFilters, Logger, Inject } from '@nestjs/common';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { CreateContentDto, UpdateContentDto, QueryContentDto } from '@story-pull/types';

import { ContentService } from './content.service';
import { transformToRpcException } from '../../utils/operators/rpc-transformer.operator';
import { Auth } from '../../shared/decorators/auth.decorator';
import { RpcExceptionFilter } from '../../shared/filters/rpc-exception.filter';

@Controller('content')
@UseFilters(new RpcExceptionFilter())
export class ContentController {
  private readonly logger = new Logger(ContentController.name);

  constructor(
    private readonly contentService: ContentService,
    @Inject('AUTH_SERVICE') private authClient: ClientProxy,
  ) {}

  @MessagePattern({ cmd: 'createContent' })
  @Auth()
  create(@Payload('data') data: CreateContentDto) {
    this.logger.log(`Creating new content: ${JSON.stringify(data)}`);
    return this.contentService.create(data).pipe(transformToRpcException());
  }

  @MessagePattern({ cmd: 'findAllContent' })
  @Auth()
  findAll(@Payload('data') data: QueryContentDto) {
    this.logger.log(`Finding all content with query: ${JSON.stringify(data)}`);
    return this.contentService.findAllPaginated(data).pipe(transformToRpcException());
  }

  @MessagePattern({ cmd: 'findContentById' })
  @Auth()
  findById(@Payload() data: { id: string }) {
    this.logger.log(`Finding content with ID: ${data.id}`);
    return this.contentService.findById(data.id).pipe(transformToRpcException());
  }

  @MessagePattern({ cmd: 'updateContent' })
  @Auth()
  update(@Payload() { id, data }: { id: string; data: UpdateContentDto }) {
    this.logger.log(`Updating content with ID: ${id}`);
    return this.contentService.update(id, data).pipe(transformToRpcException());
  }

  @MessagePattern({ cmd: 'updateType' })
  @Auth()
  updateType(@Payload() { id, data }: { id: string; data: { type: string } }) {
    this.logger.log(`Updating content type with ID: ${id}`);
    return this.contentService.update(id, data).pipe(transformToRpcException());
  }
}
