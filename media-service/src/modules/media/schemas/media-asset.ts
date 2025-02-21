import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MediaAssetDocument = HydratedDocument<MediaAsset>;

@Schema({
  timestamps: true,
  collection: 'media_assets',
})
export class MediaAsset {
  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  storedFilename: string;

  @Prop({ required: true })
  filepath: string;

  @Prop({ required: true })
  mimetype: string;

  @Prop({ required: true })
  size: number;

  @Prop({
    type: String,
    enum: ['image', 'video', 'document', 'audio'],
    required: true,
  })
  type: string;

  @Prop()
  collection?: string;

  @Prop({ type: Object })
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    // Other media-specific metadata
  };

  @Prop()
  tags?: string[];

  @Prop({ required: true })
  uploadedBy: string;

  @Prop({ default: 0 })
  usageCount: number;

  @Prop({ type: [String], default: [] })
  references: string[];
}

export const MediaAssetSchema = SchemaFactory.createForClass(MediaAsset);

// Add indexes for performance
MediaAssetSchema.index({ type: 1 });
MediaAssetSchema.index({ collection: 1 });
MediaAssetSchema.index({ uploadedBy: 1 });
MediaAssetSchema.index({ createdAt: -1 });
