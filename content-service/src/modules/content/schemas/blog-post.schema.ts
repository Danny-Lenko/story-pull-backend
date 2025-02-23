import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ContentBase } from './content-base.schema';
import { Document } from 'mongoose';

@Schema({ collection: 'blog_posts' })
export class BlogPost extends ContentBase {
  @Prop({
    required: [true, 'Author is required'],
    trim: true,
    minlength: [2, 'Author name must be at least 2 characters long'],
    maxlength: [100, 'Author name cannot be longer than 100 characters'],
  })
  author: string;

  @Prop({
    type: [String],
    validate: {
      validator: function (v) {
        return v.length <= 5; // Maximum 5 keywords
      },
      message: 'Cannot have more than 5 keywords',
    },
  })
  keywords?: string[];

  @Prop({
    type: String,
    validate: {
      validator: function (v) {
        return v === undefined || /^https?:\/\//.test(v);
      },
      message: 'Image URL must be a valid URL starting with http:// or https://',
    },
  })
  featuredImage?: string;
}

export type BlogPostDocument = BlogPost & Document;
export const BlogPostSchema = SchemaFactory.createForClass(BlogPost);
