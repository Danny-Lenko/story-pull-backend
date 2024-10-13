import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Content, ContentSchema } from '../../models/content.model';
import { ContentService } from './content.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Content.name, schema: ContentSchema }])],
  providers: [ContentService],
  exports: [ContentService],
})
export class ContentModule {}
