// media-service/src/models/Document.ts
import BaseMedia from './BaseMedia';

const Document = BaseMedia.discriminator(
  'Document',
  new mongoose.Schema({
    pageCount: Number,
    fileType: String,
  }),
);

export default Document;
