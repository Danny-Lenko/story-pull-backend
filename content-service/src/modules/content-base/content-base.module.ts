import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContentBase, ContentBaseSchema } from './schemas/content-base.schema';
import { ContentBaseController } from './controllers/content-base.controller';
import { ContentBaseService } from './services/content-base.service';
import { Article, ArticleSchema } from '../content/schemas/article.schema';
import { BlogPost, BlogPostSchema } from '../content/schemas/blog-post.schema';
import { Page, PageSchema } from '../content/schemas/page.schema';

// thoughts on the dynamic fields with discriminators https://claude.ai/chat/7d24e06b-02e1-44f8-b3e1-eb7f4ea2fa19 || devdanny.14
// https://chat.deepseek.com/a/chat/s/5710ad9d-b406-4f1b-9ddf-6e6a363edaee || devdanny.14

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ContentBase.name,
        schema: ContentBaseSchema,
        discriminators: [
          { name: Article.name, schema: ArticleSchema },
          { name: BlogPost.name, schema: BlogPostSchema },
          { name: Page.name, schema: PageSchema },
        ],
      },
    ]),
  ],
  controllers: [ContentBaseController],
  providers: [ContentBaseService, Logger],
  exports: [ContentBaseService],
})
export class ContentModule {}
