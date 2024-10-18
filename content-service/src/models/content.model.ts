import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export interface ContentDocument extends Content, Document {
  slug: string;
}

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret._id;
      return ret;
    },
  },
})
export class Content {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true })
  body: string;

  @Prop({ required: true, enum: ['article', 'page', 'blog_post'] })
  type: string;

  @Prop({ required: true })
  author: string;

  @Prop({ default: 'draft', enum: ['draft', 'published', 'archived'] })
  status: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  metadata: Record<string, unknown>;

  @Prop({ type: [String], index: true })
  tags: string[];

  @Prop({ type: Date })
  publishedAt: Date;

  @Prop({ type: MongooseSchema.Types.Mixed })
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
  };

  @Prop({ default: 0 })
  version: number;
}

export const ContentSchema = SchemaFactory.createForClass(Content);

// Indexes
ContentSchema.index({ title: 'text', body: 'text' });
ContentSchema.index({ type: 1, status: 1 });
ContentSchema.index({ tags: 1 });
ContentSchema.index({ createdAt: -1 });
ContentSchema.index({ publishedAt: -1 });

// Virtual for URL slug
ContentSchema.virtual('slug').get(function (this: ContentDocument) {
  return this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
});
