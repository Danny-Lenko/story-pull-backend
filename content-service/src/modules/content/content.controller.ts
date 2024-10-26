import { Controller, UsePipes, UseFilters, Logger, Inject } from '@nestjs/common';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { ContentService } from './content.service';
import { CreateContentDto } from './dto/create-content.dto';
import { ValidationPipe } from '../../shared/pipes/validation.pipe';
import { RpcExceptionFilter } from '../../shared/filters/rpc-exception.filter';
import { Auth } from '../../shared/decorators/auth.decorator';
import { QueryContentDto } from './dto/query-content.dto';
import { transformToRpcException } from 'src/utils/operators/rpc-transformer.operator';

@Controller('content')
@UseFilters(new RpcExceptionFilter())
export class ContentController {
  private readonly logger = new Logger(ContentController.name);

  constructor(
    private readonly contentService: ContentService,
    @Inject('AUTH_SERVICE') private authClient: ClientProxy,
  ) {}

  @MessagePattern({ cmd: 'createContent' })
  @UsePipes(new ValidationPipe())
  @Auth()
  async create(@Payload('data') data: CreateContentDto) {
    this.logger.log(`Creating new content: ${JSON.stringify(data)}`);
    return this.contentService.create(data).pipe(transformToRpcException());
  }

  @MessagePattern({ cmd: 'findAllContent' })
  @UsePipes(new ValidationPipe())
  @Auth()
  async findAll(@Payload('data') data: QueryContentDto) {
    this.logger.log(`Finding all content with query: ${JSON.stringify(data)}`);
    return this.contentService.findAllPaginated(data).pipe(transformToRpcException());
  }
}
