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
  // Define both directory names and valid types

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

  // saveFile(file: Express.Multer.File): Observable<MediaAsset> {
  // const fileType = this.getFileType(file.mimetype);
  // if (!fileType) {
  //   throw new Error(`Unsupported file type: ${file.mimetype}`);
  // }
  // const filename = `${Date.now()}-${file.originalname}`;
  // const directory = this.getDirectoryForType(fileType);
  // const subDirectory = path.join(this.baseUploadDir, directory);
  // const filePath = path.join(subDirectory, filename);
  // // Create metadata first
  // return from(
  //   this.mediaAssetService.createMediaAsset({
  //     filename: file.originalname,
  //     storedFilename: filename,
  //     filepath: `${directory}/${filename}`,
  //     mimetype: file.mimetype,
  //     size: file.size,
  //     type: fileType,
  //     uploadedBy: 'current-user-id',
  //     // metadata: this.extractMetadata(file),
  //     metadata: { width: 100, height: 100 }, // mock metadata
  //   }),
  // ).pipe(
  // If metadata creation succeeds, save the file
  // mergeMap((mediaAsset) => {
  //   this.logger.debug(`MEDIAASSET ${mediaAsset}`);
  //   return from(writeFile(filePath, this.getFileBuffer(file))).pipe(
  //     map(() => mediaAsset),
  //     catchError((error) => {
  //       // Attach the media asset id so that cleanup deletes it from the database
  //       error.mediaAssetId = mediaAsset.storedFilename;
  //       return throwError(() => error);
  //     }),
  //   );
  // }),
  // catchError((error) => {
  //   // Cleanup on error
  //   return from(
  //     (async () => {
  //       if (fs.existsSync(filePath)) {
  //         await fs.promises.unlink(filePath);
  //       }
  //       if (error.mediaAssetId) {
  //         await this.mediaAssetService.deleteMediaAsset(error.mediaAssetId);
  //       }
  //       throw error;
  //     })(),
  //   );
  // }),
  // catchError((error) => {
  //   this.logger.error(`Failed to save file ${filename}:`, error);
  //   throw error;
  // }),
  // );
  // }

  saveFile({ file, storedFilename }: { file: Express.Multer.File; storedFilename: string }) {
    const fileType = getFileType(file.mimetype);
    if (!fileType) {
      throw new Error(`Unsupported file type: ${file.mimetype}`);
    }

    const directory = getDirectoryForType(fileType);
    const subDirectory = path.join(this.baseUploadDir, directory);
    const filePath = path.join(subDirectory, storedFilename);

    return from(writeFile(filePath, this.getFileBuffer(file))).pipe(
      // map(() => mediaAsset),
      catchError((error) => {
        // Attach the media asset id so that cleanup deletes it from the database
        // error.mediaAssetId = mediaAsset.storedFilename;
        return throwError(() => error);
      }),
    );
    // Create metadata first
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
