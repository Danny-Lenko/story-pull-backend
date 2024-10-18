import { Controller, UsePipes, UseFilters, Logger, Inject } from '@nestjs/common';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { ContentService } from './content.service';
import { CreateContentDto } from './dto/create-content.dto';
import { ValidationPipe } from '../../shared/pipes/validation.pipe';
import { RpcExceptionFilter } from '../../shared/filters/rpc-exception.filter';
import { Auth } from 'src/shared/decorators/auth.decorator';

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
  async create(@Payload() createContentDto: CreateContentDto) {
    this.logger.log(`Creating new content: ${JSON.stringify(createContentDto)}`);
    try {
      const result = await this.contentService.create(createContentDto);
      this.logger.log(`Content created successfully: ${result}`);
      return result;
    } catch (error) {
      this.logger.error(`Error creating content: ${error.message}`, error.stack);
      throw error;
    }
  }
}
