import { Controller, UseFilters } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { catchError, forkJoin, map } from 'rxjs';
import { StorageService } from '../services/storage.service';
import { transformToRpcException } from '../../../utils/operators/rpc-transformer.operator';
import { RpcExceptionFilter } from '../../../shared/filters/rpc-exception.filter';
import { MediaAssetService } from '../services/media-asset.service';

@Controller()
@UseFilters(new RpcExceptionFilter())
export class MediaController {
  constructor(
    private readonly storageService: StorageService,
    private readonly mediaAssetService: MediaAssetService,
    // private readonly logger: Logger,
  ) {}

  @MessagePattern({ cmd: 'uploadFile' })
  uploadFile({ file, userId }: { file: Express.Multer.File; userId: string }) {
    // this.logger.verbose(`USER: ${userId} is uploading file: ${file.originalname}`);

    // return this.storageService.saveFile(file).pipe(
    //   map((filename) => filename),
    //   transformToRpcException(),
    // );

    const storedFilename = `${Date.now()}-${file.originalname}`;
    // create uuid to then add to the file metadata

    return forkJoin({
      mediaAsset: this.mediaAssetService.createMediaAsset({ file, storedFilename, userId }),
      fileSave: this.storageService.saveFile({ file, storedFilename }),
    }).pipe(
      catchError(async (error) => {
        await Promise.all([
          this.mediaAssetService.deleteMediaAsset(storedFilename),
          // this.storageService.deleteFile(storedFilename),
        ]);
        throw error;
      }),
      map(({ mediaAsset }) => {
        // this.logger.log(mediaAsset);
        return mediaAsset;
      }),
      transformToRpcException(),
    );
  }

  @MessagePattern({ cmd: 'getFile' })
  getFile(@Payload() filename: string) {
    return this.storageService.getFile(filename).pipe(transformToRpcException());
  }
}
