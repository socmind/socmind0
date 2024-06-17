// claude.main.ts
import { NestFactory } from '@nestjs/core';
import { ClaudeModule } from './claude.module';

async function bootstrap() {
  try {
    await NestFactory.createApplicationContext(ClaudeModule);
    console.log('claude started');
  } catch (error) {
    console.error('Error starting claude:', error);
  }
}

bootstrap();
