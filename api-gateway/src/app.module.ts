import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { ContentModule } from './modules/content/content.module';
import { MediaModule } from './modules/media/media.module';
import { AuthModule } from './modules/auth/auth.module';

// thoughts on overall content flow: https://chat.deepseek.com/a/chat/s/426cad87-62cd-42c9-809b-7aa9d17b1d41 || devdanny.14

@Module({
  imports: [
    AuthModule,
    MediaModule,
    ContentModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
  ],
})
export class AppModule {}
