import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './shared/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Main');

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: configService.get<number>('TCP_PORT'),
    },
  });

  app.useGlobalFilters(new GlobalExceptionFilter());
  // app.useGlobalPipes(new ValidationPipe());

  await app.startAllMicroservices();
  await app.listen(configService.get<number>('HTTP_PORT'));

  logger.log(`Auth microservice is listening on port ${configService.get<number>('TCP_PORT')}`);
  logger.log(`Auth HTTP server is listening on port ${configService.get<number>('HTTP_PORT')}`);
}

bootstrap().catch((error) => {
  console.error('An error occurred during bootstrap:', error);
});
