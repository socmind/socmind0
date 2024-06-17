// src/user/user.main.ts
import { NestFactory } from '@nestjs/core';
import { UserModule } from './user.module';

async function bootstrap() {
  try {
    await NestFactory.createApplicationContext(UserModule);
    console.log('user started');
  } catch (error) {
    console.error('Error starting user:', error);
  }
}

bootstrap();
