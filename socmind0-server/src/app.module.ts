// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './chat/infrastructure/database/prisma.module';
import { RabbitMQModule } from './chat/infrastructure/message-broker/rabbitmq.module';
import { ChatModule } from './chat/chat.module';
import { UserModule } from './user/user.module';
import { GptModule } from './agents/gpt/gpt.module';
import { ClaudeModule } from './agents/claude/claude.module';
import { GeminiModule } from './agents/gemini/gemini.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    RabbitMQModule,
    ChatModule,
    UserModule,
    GptModule,
    ClaudeModule,
    GeminiModule,
  ],
})
export class AppModule {}
