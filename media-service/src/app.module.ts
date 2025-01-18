import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import config from './config/config';
import { MediaModule } from './modules/media/media.module';
import { MediaController } from './modules/media/controllers/media.controller';
import { StorageService } from './modules/media/services/storage.service';

@Module({
  imports: [
    MediaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
  ],
  controllers: [AppController, MediaController],
  providers: [AppService, StorageService],
})
export class AppModule {}
