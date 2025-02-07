import { MEDIA_TYPES } from '../../modules/media/constants/media-types';

export function getDirectoryForType(type: string): string {
  return MEDIA_TYPES[type]?.directory || '';
}
