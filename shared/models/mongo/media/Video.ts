// media-service/src/models/Video.ts
import BaseMedia from './BaseMedia';

const Video = BaseMedia.discriminator(
  'Video',
  new mongoose.Schema({
    duration: Number,
    resolution: String,
  }),
);

export default Video;
