// content-base.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

interface CustomFields {
  [key: string]: string | number | Date | boolean;
}

@Schema({
  discriminatorKey: 'type',
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret._id;
      return ret;
    },
  },
})
export class ContentBase {
  @Prop({
    required: [true, 'Title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters long'],
    maxlength: [255, 'Title cannot be longer than 255 characters'],
  })
  title: string;

  @Prop({
    required: [true, 'Body is required'],
    minlength: [3, 'Body must be at least 3 characters long'],
    maxlength: [50000, 'Body cannot be longer than 50000 characters'],
  })
  body: string;

  @Prop({
    required: [true, 'Author ID is required'],
    trim: true,
  })
  creatorId: string;

  @Prop({
    default: 'draft',
    enum: ['draft', 'published', 'archived'],
  })
  status: string;

  @Prop({
    type: Date,
  })
  publishedAt?: Date;

  @Prop({ type: Object })
  customFields: CustomFields; // Динамічні поля

  @Prop({
    default: 0,
    min: [0, 'Version cannot be negative'],
  })
  version?: number;
}

export type ContentBaseDocument = ContentBase & Document;
export const ContentBaseSchema = SchemaFactory.createForClass(ContentBase);

// Add virtual for URL slug
ContentBaseSchema.virtual('slug').get(function (this: ContentBaseDocument) {
  return this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
});

// Add indexes for performance optimization
ContentBaseSchema.index({ title: 'text', body: 'text' });
ContentBaseSchema.index({ type: 1, status: 1 });
ContentBaseSchema.index({ createdAt: -1 });
ContentBaseSchema.index({ publishedAt: -1 });
ContentBaseSchema.index({ type: 1, status: 1, publishedAt: -1 });
