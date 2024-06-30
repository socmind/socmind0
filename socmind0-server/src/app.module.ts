// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GeminiModule } from './agents/gemini/gemini.module';
import { GptModule } from './agents/gpt/gpt.module';
import { ClaudeModule } from './agents/claude/claude.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './infrastructure/database/prisma.module';
import { RabbitMQModule } from './infrastructure/message-broker/rabbitmq.module';
import { ChatModule } from './chat/chat.module';

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
    GeminiModule,
    ClaudeModule,
  ],
})
export class AppModule {}
