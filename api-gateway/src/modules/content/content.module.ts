import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { ContentController } from './content.controller';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'CONTENT_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('CONTENT_SERVICE_HOST'),
            port: configService.get('CONTENT_SERVICE_PORT'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [ContentController],
})
export class ContentModule {}
