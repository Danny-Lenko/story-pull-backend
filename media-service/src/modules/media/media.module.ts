import { Module } from '@nestjs/common';
import { MediaController } from './controllers/media.controller';
import { StorageService } from './services/storage.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [MediaController],
  providers: [StorageService],
})
export class MediaModule {}
