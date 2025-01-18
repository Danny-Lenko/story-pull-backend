import {
  Controller,
  Inject,
  Get,
  Post,
  UseInterceptors,
  UploadedFile,
  Param,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';

import { handleRpcError } from '../../utils/operators/rpc-error-handler.operator';
import { FileInterceptor } from '@nestjs/platform-express';

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
    console.log('MediaController.uploadFile()');
    console.log('file', file);
    return this.mediaService.send({ cmd: 'uploadFile' }, { file }).pipe(handleRpcError());
  }

  @Get(':filename')
  getFile(@Param('filename') filename: string): Observable<unknown> {
    return this.mediaService.send({ cmd: 'getFile' }, filename).pipe(handleRpcError());
  }
}
