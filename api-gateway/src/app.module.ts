import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { ContentModule } from './modules/content/content.module';
import { MediaModule } from './modules/media/media.module';

@Module({
  imports: [
    MediaModule,
    ContentModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
  ],
})
export class AppModule {}
