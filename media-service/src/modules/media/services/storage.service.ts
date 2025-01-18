import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

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

  async saveFile(file: Express.Multer.File): Promise<string> {
    const filename = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(this.uploadDir, filename);

    try {
      const fileBuffer = Buffer.isBuffer(file.buffer)
        ? file.buffer
        : Buffer.from((file.buffer as unknown as { data: number[] }).data);

      await writeFile(filePath, fileBuffer);
      return filename;
    } catch (error) {
      this.logger.error(`Failed to save file ${filename}:`, error);
      throw error;
    }
  }

  getFilePath(filename: string): string {
    return path.join(this.uploadDir, filename);
  }
}
