// gemini.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GeminiState } from './gemini.state';
import { GeminiService } from './gemini.service';
import { GeminiController } from './gemini.controller';
import { RabbitMQModule } from 'src/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RabbitMQModule,
  ],
  controllers: [GeminiController],
  providers: [GeminiService, GeminiState],
  exports: [GeminiService, GeminiState],
})
export class GeminiModule {}
