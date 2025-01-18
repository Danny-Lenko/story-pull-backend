import { BadRequestException, Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { StorageService } from '../services/storage.service';

@Controller()
export class MediaController {
  constructor(private readonly storageService: StorageService) {}

  @MessagePattern({ cmd: 'getHello' })
  getHello() {
    console.log('MediaController.getHello()');
    return 'Hello from Media Service!';
  }

  @MessagePattern({ cmd: 'uploadFile' })
  async uploadFile(data: { file: Express.Multer.File }) {
    console.log('DATA:', data);
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
      return { filePath };
    } catch (error) {
      console.error(error);
      throw new BadRequestException('File not found');
    }
  }
}
