import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ContentBase } from '../../content-base/schemas/content-base.schema';
import { Document } from 'mongoose';

@Schema({ collection: 'pages' })
export class Page extends ContentBase {
  @Prop({
    default: false,
  })
  isHomepage: boolean;

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
    },
  })
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
}

export type PageDocument = Page & Document;
export const PageSchema = SchemaFactory.createForClass(Page);
