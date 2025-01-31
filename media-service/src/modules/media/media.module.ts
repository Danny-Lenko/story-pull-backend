import { Module } from '@nestjs/common';
import { MediaController } from './controllers/media.controller';
import { StorageService } from './services/storage.service';
import { ConfigModule } from '@nestjs/config';
import { MediaAssetService } from './services/media-asset.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaAsset, MediaAssetSchema } from './schemas/media-asset';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: MediaAsset.name, schema: MediaAssetSchema }]),
  ],
  controllers: [MediaController],
  providers: [StorageService, MediaAssetService],
})
export class MediaModule {}
