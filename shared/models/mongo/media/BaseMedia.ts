// media-service/src/models/BaseMedia.ts

import mongoose from 'mongoose';

const baseMediaSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    url: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    relatedContent: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { discriminatorKey: 'mediaType' },
);

const BaseMedia = mongoose.model('BaseMedia', baseMediaSchema);

export default BaseMedia;
