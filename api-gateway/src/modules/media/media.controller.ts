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
  ParseFilePipe,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { FileInterceptor } from '@nestjs/platform-express';
import { createReadStream } from 'fs';
import { Response } from 'express';

import { handleRpcError } from '../../utils/operators/rpc-error-handler.operator';
import { CustomFileValidator } from 'src/utils/helpers/custom-file-validator';
import { JwtAuthGuard } from 'src/shared/guards/jwt.auth.guard';
import { UserId } from 'src/shared/decorators/userId.decorator';

@UseGuards(JwtAuthGuard)
@Controller('api/media')
export class MediaController {
  constructor(
    @Inject('MEDIA_SERVICE') private readonly mediaService: ClientProxy,
    private readonly logger: Logger,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new CustomFileValidator({})],
      }),
    )
    file: Express.Multer.File,
    @UserId() userId: string,
  ): Observable<unknown> {
    this.logger.log(`User ${userId} uploaded file ${file.originalname}`);

    return this.mediaService.send({ cmd: 'uploadFile' }, { file, userId }).pipe(handleRpcError());
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
