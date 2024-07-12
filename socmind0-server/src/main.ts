// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.init();
  const server = await app.listen(3000);
  console.log(
    `Application is running on: http://localhost:${server.address().port}`,
  );
}
bootstrap();
