export const MEDIA_TYPES = {
  image: {
    directory: 'images',
    mimePattern: /\/(jpg|jpeg|png|gif|svg)$/i,
  },
  document: {
    directory: 'documents',
    mimePattern: /\/(pdf|md|txt|doc|docx|plain)$/i,
  },
  video: {
    directory: 'videos',
    mimePattern: /\/(mp4|webm)$/i,
  },
  audio: {
    directory: 'audio',
    mimePattern: /\/(mp3|wav)$/i,
  },
} as const;
