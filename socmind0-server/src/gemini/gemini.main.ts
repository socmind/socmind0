// gemini.main.ts
import { NestFactory } from '@nestjs/core';
import { GeminiModule } from './gemini.module';

async function bootstrap() {
  try {
    await NestFactory.createApplicationContext(GeminiModule);
    console.log('gemini started');
  } catch (error) {
    console.error('Error starting gemini:', error);
  }
}

bootstrap();
