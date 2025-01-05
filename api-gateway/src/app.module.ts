import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthController } from './modules/auth/auth.controller';
import { ContentController } from './modules/content/content.controller';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ClientsModule.registerAsync([
      // {
      //   name: 'AUTH_SERVICE',
      //   useFactory: (configService: ConfigService) => ({
      //     transport: Transport.TCP,
      //     options: {
      //       host: configService.get('AUTH_SERVICE_HOST'),
      //       port: configService.get('AUTH_SERVICE_PORT'),
      //     },
      //   }),
      //   inject: [ConfigService],
      // },
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
  controllers: [AuthController, ContentController],
})
export class AppModule {}
