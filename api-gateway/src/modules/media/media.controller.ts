import {
  Controller,
  Inject,
  Get,
  Post,
  UseInterceptors,
  UploadedFile,
  Param,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { FileInterceptor } from '@nestjs/platform-express';
import { createReadStream } from 'fs';
import { Response } from 'express';

import { handleRpcError } from '../../utils/operators/rpc-error-handler.operator';

@Controller('api/media')
export class MediaController {
  constructor(@Inject('MEDIA_SERVICE') private readonly mediaService: ClientProxy) {}

  @Get('hello')
  hello(): Observable<unknown> {
    console.log('MediaController.hello()');
    console.log('this.mediaService', this.mediaService);
    return this.mediaService.send({ cmd: 'getHello' }, {}).pipe(handleRpcError());
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File): Observable<unknown> {
    console.log('file', file);
    return this.mediaService.send({ cmd: 'uploadFile' }, { file }).pipe(handleRpcError());
  }

  @Get(':filename')
  async getFile(
    @Param('filename') filename: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await firstValueFrom(
      this.mediaService.send({ cmd: 'getFile' }, filename).pipe(handleRpcError()),
    );

    if (!result?.filePath || !result?.mimeType) {
      throw new Error('File not found');
    }

    const file = createReadStream(result.filePath);
    response.set({
      'Content-Type': result.mimeType,
      'Content-Disposition': `inline; filename="${filename}"`,
    });

    return new StreamableFile(file);
  }
}
