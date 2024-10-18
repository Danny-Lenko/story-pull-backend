import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Content, ContentSchema } from '../../models/content.model';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { MicroserviceAuthGuard } from 'src/shared/guards/auth.guard';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Content.name, schema: ContentSchema }]),
    ClientsModule.registerAsync([
      {
        name: 'AUTH_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('AUTH_SERVICE_HOST'),
            port: configService.get('AUTH_SERVICE_PORT'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [ContentController],
  providers: [ContentService, MicroserviceAuthGuard],
  exports: [ContentService],
})
export class ContentModule {}
