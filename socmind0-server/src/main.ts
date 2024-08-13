// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create(AppModule);

    app.enableCors({
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    });

    await app.init();
    const server = await app.listen(3001);

    logger.log(
      `Application is running on: http://localhost:${server.address().port}`,
    );
  } catch (error) {
    logger.error('Failed to start the application', error.stack);
    process.exit(1);
  }
}

bootstrap();
