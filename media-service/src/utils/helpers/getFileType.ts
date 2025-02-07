import { MEDIA_TYPES } from '../../modules/media/constants/media-types';

export function getFileType(mimetype: string): string | null {
  for (const [type, config] of Object.entries(MEDIA_TYPES)) {
    if (config.mimePattern.test(mimetype)) {
      return type;
    }
  }
  return null;
}
