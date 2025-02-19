// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create(AppModule);

    const configService = app.get(ConfigService);
    const host = configService.get<string>('HOST', 'localhost');
    const port = configService.get<number>('PORT', 3001);
    const appUrl = configService.get<string>(
      'APP_URL',
      `http://${host}:${port}`,
    );
    const corsOrigin = configService.get<string>(
      'CORS_ORIGIN',
      'http://localhost:3000',
    );

    app.enableCors({
      origin: corsOrigin,
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    });

    await app.init();
    const server = await app.listen(port);

    logger.log(`Application is running on: ${appUrl}`);
  } catch (error) {
    logger.error('Failed to start the application', error.stack);
    process.exit(1);
  }
}

bootstrap();
