import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { catchError, from, Observable, of, throwError } from 'rxjs';
import { promisify } from 'util';
import * as mimeTypes from 'mime-types';

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly uploadDir: string;

  constructor(private configService: ConfigService) {
    this.uploadDir = this.configService.get<string>('UPLOAD_DIR') || '../shared/uploads';
    this.initializeStorage();
  }

  private async initializeStorage() {
    try {
      await mkdir(this.uploadDir, { recursive: true });
      this.logger.log(`Storage initialized at ${this.uploadDir}`);
    } catch (error) {
      this.logger.error('Failed to initialize storage:', error);
      throw error;
    }
  }

  saveFile(file: Express.Multer.File): Observable<string> {
    const filename = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(this.uploadDir, filename);

    // Convert promise to Observable
    return from(writeFile(filePath, this.getFileBuffer(file)).then(() => filename)).pipe(
      catchError((error) => {
        this.logger.error(`Failed to save file ${filename}:`, error);
        throw error;
      }),
    );
  }

  getFile(filename: string): Observable<{ filePath: string; mimeType: string }> {
    const filePath = this.getFilePath(filename);

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
    return path.join(this.uploadDir, filename);
  }
}
