import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import configuration from './config/configuration';
import { Content, ContentSchema } from './models/content.model';
import { ContentModule } from './modules/content/content.module';
import { ContentBaseModule } from './content-base/content-base.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: Content.name, schema: ContentSchema }]),

    ContentModule,

    ContentBaseModule,
  ],
})
export class AppModule {}
