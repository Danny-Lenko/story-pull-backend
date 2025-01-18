import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  // const app = await NestFactory.create(AppModule);
  // await app.listen(3000);

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Main');

  app.useGlobalPipes(new ValidationPipe());

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: configService.get<number>('MEDIA_SERVICE_PORT'),
    },
  });

  await app.startAllMicroservices();
  await app.listen(configService.get<number>('MEDIA_SERVICE_HTTP_PORT'));

  logger.log(
    `Content microservice is listening on port ${configService.get<number>('MEDIA_SERVICE_PORT')}`,
  );
  logger.log(
    `Content HTTP server is listening on port ${configService.get<number>('MEDIA_SERVICE_HTTP_PORT')}`,
  );
}

bootstrap().catch((error) => {
  console.error('An error occurred during bootstrap:', error);
});
