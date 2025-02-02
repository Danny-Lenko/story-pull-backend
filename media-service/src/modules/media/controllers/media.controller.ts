import { Controller, UseFilters } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { map } from 'rxjs';
import { StorageService } from '../services/storage.service';
import { transformToRpcException } from '../../../utils/operators/rpc-transformer.operator';
import { RpcExceptionFilter } from '../../../shared/filters/rpc-exception.filter';

@Controller()
@UseFilters(new RpcExceptionFilter())
export class MediaController {
  constructor(private readonly storageService: StorageService) {}

  @MessagePattern({ cmd: 'uploadFile' })
  uploadFile(data: { file: Express.Multer.File }) {
    return this.storageService.saveFile(data.file).pipe(
      map((filename) => filename),
      transformToRpcException(),
    );
  }

  @MessagePattern({ cmd: 'getFile' })
  getFile(@Payload() filename: string) {
    return this.storageService.getFile(filename).pipe(transformToRpcException());
  }
}
