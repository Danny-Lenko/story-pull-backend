import { Controller, Logger, UseFilters } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { catchError, forkJoin, map } from 'rxjs';
import { StorageService } from '../services/storage.service';
import { transformToRpcException } from '../../../utils/operators/rpc-transformer.operator';
import { RpcExceptionFilter } from '../../../shared/filters/rpc-exception.filter';
import { MediaAssetService } from '../services/media-asset.service';
import { MediaAssetDocument } from '../schemas/media-asset';

// ================================ TODO: ADD DELETE FILE METHOD ================================

@Controller()
@UseFilters(new RpcExceptionFilter())
export class MediaController {
  private readonly logger = new Logger(MediaController.name);

  constructor(
    private readonly storageService: StorageService,
    private readonly mediaAssetService: MediaAssetService,
  ) {}

  @MessagePattern({ cmd: 'uploadFile' })
  uploadFile({ file, userId }: { file: Express.Multer.File; userId: string }) {
    this.logger.verbose(`USER: ${userId} is uploading file: ${file.originalname}`);

    const storedFilename = `${Date.now()}-${file.originalname}`;

    return forkJoin({
      mediaAsset: this.mediaAssetService.createMediaAsset({ file, storedFilename, userId }),
      fileSave: this.storageService.saveFile({ file, storedFilename }),
    }).pipe(
      catchError(async (error) => {
        await Promise.all([this.mediaAssetService.deleteMediaAsset(storedFilename)]);
        throw error;
      }),
      map(({ mediaAsset }) => {
        return mediaAsset;
      }),
      transformToRpcException(),
    );
  }

  @MessagePattern({ cmd: 'getFile' })
  async getFile(@Payload() filename: string) {
    const mediaAsset = (await this.mediaAssetService.findOneByStoredFilename(
      filename,
    )) as MediaAssetDocument;
    if (mediaAsset) {
      await this.mediaAssetService.incrementUsageCount(mediaAsset._id);
    }
    return this.storageService.getFile(filename).pipe(transformToRpcException());
  }
}
