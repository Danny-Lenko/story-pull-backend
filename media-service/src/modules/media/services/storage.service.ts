import * as fs from 'fs';
import * as path from 'path';
import * as mimeTypes from 'mime-types';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catchError, from, Observable, of, throwError } from 'rxjs';
import { promisify } from 'util';

import { MEDIA_TYPES } from '../constants/media-types';
import { getFileType } from '../../../utils/helpers/getFileType';
import { getDirectoryForType } from '../../../utils/helpers/getDirectoryForType';

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly baseUploadDir: string;

  constructor(private configService: ConfigService) {
    this.baseUploadDir = this.configService.get<string>('UPLOAD_DIR') || '../shared/uploads';
    this.initializeStorage();
  }

  private async initializeStorage() {
    try {
      // Create base upload directory
      await mkdir(this.baseUploadDir, { recursive: true });

      // Create subdirectories for each file type
      const directories = ['images', 'documents', 'videos', 'audio'];
      await Promise.all(
        directories.map((dir) => mkdir(path.join(this.baseUploadDir, dir), { recursive: true })),
      );

      this.logger.log(`Storage initialized at ${this.baseUploadDir}`);
    } catch (error) {
      this.logger.error('Failed to initialize storage:', error);
      throw error;
    }
  }

  saveFile({ file, storedFilename }: { file: Express.Multer.File; storedFilename: string }) {
    const fileType = getFileType(file.mimetype);
    if (!fileType) {
      throw new Error(`Unsupported file type: ${file.mimetype}`);
    }

    const directory = getDirectoryForType(fileType);
    const subDirectory = path.join(this.baseUploadDir, directory);
    const filePath = path.join(subDirectory, storedFilename);

    return from(writeFile(filePath, this.getFileBuffer(file))).pipe(
      catchError((error) => {
        return throwError(() => error);
      }),
    );
  }

  getFile(filename: string): Observable<{ filePath: string; mimeType: string }> {
    const mimeType = mimeTypes.lookup(filename) || 'application/octet-stream';

    // Find the correct type and directory using the MEDIA_TYPES configuration
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const matchingType = Object.entries(MEDIA_TYPES).find(([_, config]) =>
      config.mimePattern.test(mimeType),
    );

    if (!matchingType) {
      return throwError(() => new NotFoundException('File type not supported or unknown'));
    }

    const directory = matchingType[1].directory; // Get the plural directory name
    const filePath = path.join(this.baseUploadDir, directory, filename);

    this.logger.debug(`Retrieving file: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      return throwError(() => new NotFoundException('File not found'));
    }

    return of({ filePath, mimeType });
  }

  private getFileBuffer(file: Express.Multer.File): Buffer {
    return Buffer.isBuffer(file.buffer)
      ? file.buffer
      : Buffer.from((file.buffer as unknown as { data: number[] }).data);
  }

  private getFilePath(filename: string): string {
    return path.join(this.baseUploadDir, filename);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private extractMetadata(file: Express.Multer.File) {
    // Implement metadata extraction logic
    // For images, you might use sharp
    // For videos, you might use ffprobe
    return {};
  }
}
