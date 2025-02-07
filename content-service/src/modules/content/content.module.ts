import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Content, ContentSchema } from '../../models/content.model';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Content.name, schema: ContentSchema }])],
  controllers: [ContentController],
  providers: [ContentService, Logger],
  exports: [ContentService],
})
export class ContentModule {}
