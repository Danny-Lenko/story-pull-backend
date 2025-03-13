import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { ContentBase, ContentBaseSchema } from '../content-base/schemas/content-base.schema';
import { Page, PageSchema } from '../content-base/schemas/page.schema';
import { BlogPost, BlogPostSchema } from '../content-base/schemas/blog-post.schema';
import { Article, ArticleSchema } from '../content-base/schemas/article.schema';

// thoughts on the dynamic fields with discriminators https://claude.ai/chat/7d24e06b-02e1-44f8-b3e1-eb7f4ea2fa19 || devdanny.14
// https://chat.deepseek.com/a/chat/s/5710ad9d-b406-4f1b-9ddf-6e6a363edaee || devdanny.14

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ContentBase.name,
        schema: ContentBaseSchema,
        discriminators: [
          { name: ContentBase.name, schema: ContentBaseSchema },
          { name: BlogPost.name, schema: BlogPostSchema },
          { name: Article.name, schema: ArticleSchema },
          { name: Page.name, schema: PageSchema },
        ],
      },
    ]),
  ],
  controllers: [ContentController],
  providers: [ContentService, Logger],
  exports: [ContentService],
})
export class ContentModule {}
