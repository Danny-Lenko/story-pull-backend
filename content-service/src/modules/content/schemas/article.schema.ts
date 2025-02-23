import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ContentBase } from './content-base.schema';
import { Document } from 'mongoose';

@Schema({ collection: 'articles' })
export class Article extends ContentBase {
  @Prop({
    required: [true, 'Author is required'],
    trim: true,
    minlength: [2, 'Author name must be at least 2 characters long'],
    maxlength: [100, 'Author name cannot be longer than 100 characters'],
  })
  author: string;

  @Prop({
    required: [true, 'Category is required'],
    trim: true,
    minlength: [2, 'Category must be at least 2 characters long'],
    maxlength: [50, 'Category cannot be longer than 50 characters'],
  })
  category: string;

  @Prop({
    type: [String],
    validate: {
      validator: function (v) {
        return v.length <= 10; // Maximum 10 tags
      },
      message: 'Cannot have more than 10 tags',
    },
  })
  tags?: string[];
}

export type ArticleDocument = Article & Document;
export const ArticleSchema = SchemaFactory.createForClass(Article);
