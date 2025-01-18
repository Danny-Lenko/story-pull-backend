import { BadRequestException, Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { StorageService } from '../services/storage.service';
import * as fs from 'fs';
import * as mimeTypes from 'mime-types';

@Controller()
export class MediaController {
  constructor(private readonly storageService: StorageService) {}

  @MessagePattern({ cmd: 'getHello' })
  getHello() {
    return 'Hello from Media Service!';
  }

  @MessagePattern({ cmd: 'uploadFile' })
  async uploadFile(data: { file: Express.Multer.File }) {
    try {
      const filename = await this.storageService.saveFile(data.file);
      return { filename };
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Failed to upload file');
    }
  }

  @MessagePattern({ cmd: 'getFile' })
  async getFile(filename: string) {
    try {
      const filePath = this.storageService.getFilePath(filename);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new BadRequestException('File not found');
      }

      if (fs.existsSync(filePath)) {
        console.log('File exists');
      }

      // Get mime type
      const mimeType = mimeTypes.lookup(filename) || 'application/octet-stream';

      return {
        filePath,
        mimeType,
      };
    } catch (error) {
      console.error(error);
      throw new BadRequestException('File not found');
    }
  }
}
