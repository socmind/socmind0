// gpt.main.ts
import { NestFactory } from '@nestjs/core';
import { GptModule } from './gpt.module';

async function bootstrap() {
  try {
    await NestFactory.createApplicationContext(GptModule);
    console.log('gpt started');
  } catch (error) {
    console.error('Error starting gpt:', error);
  }
}

bootstrap();
