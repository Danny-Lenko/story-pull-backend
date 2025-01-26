import { FileValidator } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';

export interface FileValidationOptions {
  type?: string;
}

export class CustomFileValidator extends FileValidator<FileValidationOptions> {
  private static readonly ALLOWED_FILE_TYPES = {
    images: /\/(jpg|jpeg|png|gif|svg)$/i,
    documents: /\/(pdf|md|txt|doc|docx)$/i,
    videos: /\/(mp4|webm)$/i,
    audio: /\/(mp3|wav)$/i,
  };

  private static readonly MAX_FILE_SIZES = {
    images: 5 * 1024 * 1024, // 5MB
    documents: 10 * 1024 * 1024, // 10MB
    videos: 100 * 1024 * 1024, // 100MB
    audio: 20 * 1024 * 1024, // 20MB
  };

  isValid(file?: Express.Multer.File): boolean {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const fileType = this.validationOptions?.type || this.determineFileType(file.mimetype);

    console.log('FILETYPE', fileType);

    if (!CustomFileValidator.ALLOWED_FILE_TYPES[fileType]) {
      throw new BadRequestException(`Unsupported file type: ${file.mimetype}`);
    }

    if (!CustomFileValidator.ALLOWED_FILE_TYPES[fileType].test(file.mimetype)) {
      throw new BadRequestException(`File type mismatch: ${file.mimetype}`);
    }

    const maxFileSize = CustomFileValidator.MAX_FILE_SIZES[fileType];
    if (file.size > maxFileSize) {
      throw new BadRequestException(
        `File size exceeds limit of ${maxFileSize / (1024 * 1024)}MB for ${fileType}`,
      );
    }

    return true;
  }

  buildErrorMessage(file: Express.Multer.File): string {
    return `File validation failed for: ${file.originalname}`;
  }

  private determineFileType(mimetype: string): string {
    const { ALLOWED_FILE_TYPES } = CustomFileValidator;

    if (ALLOWED_FILE_TYPES.images.test(mimetype)) return 'images';
    if (ALLOWED_FILE_TYPES.documents.test(mimetype)) return 'documents';
    if (ALLOWED_FILE_TYPES.videos.test(mimetype)) return 'videos';
    if (ALLOWED_FILE_TYPES.audio.test(mimetype)) return 'audio';
    return 'unknown';
  }
}
