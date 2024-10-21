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
    required: [true, 'Type is required'],
    enum: {
      values: ['article', 'page', 'blog_post'],
      message: '{VALUE} is not a valid content type',
    },
  })
  type: string;

  @Prop({
    required: [true, 'Author is required'],
    trim: true,
    minlength: [2, 'Author name must be at least 2 characters long'],
    maxlength: [100, 'Author name cannot be longer than 100 characters'],
  })
  author: string;

  @Prop({
    default: 'draft',
    enum: {
      values: ['draft', 'published', 'archived'],
      message: '{VALUE} is not a valid status',
    },
  })
  status: string;

  @Prop({
    type: MongooseSchema.Types.Mixed,
    validate: {
      validator: function (v) {
        return v === null || typeof v === 'object';
      },
      message: 'Metadata must be an object or null',
    },
  })
  metadata: Record<string, unknown>;

  @Prop({
    type: [String],
    index: true,
    validate: {
      validator: function (v) {
        return v.length <= 10; // Maximum 10 tags
      },
      message: 'Cannot have more than 10 tags',
    },
  })
  tags: string[];

  @Prop({
    type: Date,
  })
  publishedAt: Date;

  @Prop({
    type: {
      metaTitle: {
        type: String,
        maxlength: [60, 'Meta title cannot be longer than 60 characters'],
      },
      metaDescription: {
        type: String,
        maxlength: [160, 'Meta description cannot be longer than 160 characters'],
      },
      canonicalUrl: {
        type: String,
        maxlength: [2083, 'Canonical URL cannot be longer than 2083 characters'],
        validate: {
          validator: function (v) {
            return v === undefined || /^https?:\/\//.test(v);
          },
          message: 'Canonical URL must be a valid URL starting with http:// or https://',
        },
      },
    },
  })
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
  };

  @Prop({
    default: 0,
    min: [0, 'Version cannot be negative'],
  })
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

// Compound index for efficient querying
ContentSchema.index({ type: 1, status: 1, publishedAt: -1 });

// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { Document, Schema as MongooseSchema } from 'mongoose';

// export interface ContentDocument extends Content, Document {
//   slug: string;
// }

// @Schema({
//   timestamps: true,
//   toJSON: {
//     virtuals: true,
//     transform: (doc, ret) => {
//       delete ret._id;
//       return ret;
//     },
//   },
// })
// export class Content {
//   @Prop({
//     required: true,
//     trim: true,
//     maxlength: [255, 'Title cannot be longer than 255 characters'],
//   })
//   title: string;

//   @Prop({ required: true })
//   body: string;

//   @Prop({ required: true, enum: ['article', 'page', 'blog_post'] })
//   type: string;

//   @Prop({ required: true })
//   author: string;

//   @Prop({ default: 'draft', enum: ['draft', 'published', 'archived'] })
//   status: string;

//   @Prop({ type: MongooseSchema.Types.Mixed })
//   metadata: Record<string, unknown>;

//   @Prop({ type: [String], index: true })
//   tags: string[];

//   @Prop({ type: Date })
//   publishedAt: Date;

//   @Prop({ type: MongooseSchema.Types.Mixed })
//   seo: {
//     metaTitle?: string;
//     metaDescription?: string;
//     canonicalUrl?: string;
//   };

//   @Prop({ default: 0 })
//   version: number;
// }

// export const ContentSchema = SchemaFactory.createForClass(Content);

// // Indexes
// ContentSchema.index({ title: 'text', body: 'text' });
// ContentSchema.index({ type: 1, status: 1 });
// ContentSchema.index({ tags: 1 });
// ContentSchema.index({ createdAt: -1 });
// ContentSchema.index({ publishedAt: -1 });

// // Virtual for URL slug
// ContentSchema.virtual('slug').get(function (this: ContentDocument) {
//   return this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
// });
