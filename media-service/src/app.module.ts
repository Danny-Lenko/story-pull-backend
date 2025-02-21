import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from './config/config';
import { MediaModule } from './modules/media/media.module';
import { MediaController } from './modules/media/controllers/media.controller';
import { StorageService } from './modules/media/services/storage.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaAsset, MediaAssetSchema } from './modules/media/schemas/media-asset';
import { MediaAssetService } from './modules/media/services/media-asset.service';

// the TEAM essense db infrustructure https://chatgpt.com/share/67b8749c-f3fc-800a-ac36-541eae4d24c6 || danylenko.1407

@Module({
  imports: [
    MediaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: MediaAsset.name, schema: MediaAssetSchema }]),
  ],
  controllers: [AppController, MediaController],
  providers: [AppService, StorageService, MediaAssetService],
})
export class AppModule {}
