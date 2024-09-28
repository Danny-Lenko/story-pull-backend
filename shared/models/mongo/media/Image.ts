// media-service/src/models/Image.ts
import BaseMedia from './BaseMedia';

const Image = BaseMedia.discriminator(
  'Image',
  new mongoose.Schema({
    width: Number,
    height: Number,
    format: String,
  }),
);

export default Image;
