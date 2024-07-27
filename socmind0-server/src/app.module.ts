// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './chat/infrastructure/database/prisma.module';
import { RabbitMQModule } from './chat/infrastructure/message-broker/rabbitmq.module';
import { ChatModule } from './chat/chat.module';
import { UserModule } from './user/user.module';
// import { GptModule } from './program/gpt/gpt.module';
// import { ClaudeModule } from './program/claude/claude.module';
// import { GeminiModule } from './program/gemini/gemini.module';
import { ProgramModule } from './program/program.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    RabbitMQModule,
    ChatModule,
    UserModule,
    ProgramModule,
  ],
})
export class AppModule {}
