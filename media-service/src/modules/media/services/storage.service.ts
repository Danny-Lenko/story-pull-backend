import * as fs from 'fs';
import * as path from 'path';
import * as mimeTypes from 'mime-types';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catchError, from, Observable, of, throwError } from 'rxjs';
import { promisify } from 'util';
import { MediaAssetService } from './media-asset.service';
import { MediaAsset } from '../schemas/media-asset';

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly baseUploadDir: string;
  private static readonly ALLOWED_DIRECTORIES = {
    images: /\/(jpg|jpeg|png|gif|svg)$/i,
    documents: /\/(pdf|md|txt|doc|docx)$/i,
    videos: /\/(mp4|webm)$/i,
    audio: /\/(mp3|wav)$/i,
  };

  constructor(
    private configService: ConfigService,
    private mediaAssetService: MediaAssetService,
  ) {
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

  saveFile(file: Express.Multer.File): Observable<MediaAsset> {
    const fileType = this.getFileType(file.mimetype);

    if (!fileType) {
      this.logger.error(`Unsupported file type: ${file.mimetype}`);
      throw new NotFoundException(`Unsupported file type: ${file.mimetype}`);
    }

    const subDirectory = path.join(this.baseUploadDir, fileType);
    const filename = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(subDirectory, filename);

    // Convert promise to Observable
    // return from(
    //   writeFile(filePath, this.getFileBuffer(file)).then(() => `${fileType}/${filename}`),
    // ).pipe(
    //   catchError((error) => {
    //     this.logger.error(`Failed to save file ${filename}:`, error);
    //     throw error;
    //   }),
    // );

    return from(
      writeFile(filePath, this.getFileBuffer(file)).then(() => {
        // Create metadata entry
        this.logger.log(`File saved:
          filename: ${file.originalname},
          storedFilename: ${filename},
          filepath: ${fileType}/${filename},
          mimetype: ${file.mimetype},
          size: ${file.size},
          type: ${fileType},`);

        return this.mediaAssetService.createMediaAsset({
          filename: file.originalname,
          storedFilename: filename,
          filepath: `${fileType}/${filename}`,
          mimetype: file.mimetype,
          size: file.size,
          type: fileType,
          uploadedBy: 'current-user-id', // You'll need to add authentication context
          // metadata: this.extractMetadata(file),
          metadata: {},
        });
      }),
    ).pipe(
      catchError((error) => {
        this.logger.error(`Failed to save file ${filename}:`, error);
        throw error;
      }),
    );
  }

  getFile(filename: string): Observable<{ filePath: string; mimeType: string }> {
    const { ALLOWED_DIRECTORIES } = StorageService;

    const subdirectories = Object.keys(ALLOWED_DIRECTORIES);

    // Find the correct subdirectory by checking MIME types
    const matchingSubdirectory = subdirectories.find((type) => {
      const regex = ALLOWED_DIRECTORIES[type];
      return regex.test(mimeTypes.lookup(filename) || '');
    });

    if (!matchingSubdirectory) {
      return throwError(() => new NotFoundException('File type not supported or unknown'));
    }

    const filePath = path.join(this.baseUploadDir, matchingSubdirectory, filename);

    this.logger.debug(`Retrieving file: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      return throwError(() => new NotFoundException('File not found'));
    }

    const mimeType = mimeTypes.lookup(filename) || 'application/octet-stream';
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

  private getFileType(mimetype: string): string | null {
    const { ALLOWED_DIRECTORIES } = StorageService;

    for (const [type, regex] of Object.entries(ALLOWED_DIRECTORIES)) {
      if (regex.test(mimetype)) {
        return type;
      }
    }

    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private extractMetadata(file: Express.Multer.File) {
    // Implement metadata extraction logic
    // For images, you might use sharp
    // For videos, you might use ffprobe
    return {};
  }
}
