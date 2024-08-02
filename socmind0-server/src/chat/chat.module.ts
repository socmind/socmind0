// src/chat/chat.module.ts
import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatPrompts } from './chat.prompts';
import { PrismaModule } from 'src/chat/infrastructure/database/prisma.module';
import { RabbitMQModule } from 'src/chat/infrastructure/message-broker/rabbitmq.module';

@Module({
  imports: [PrismaModule, RabbitMQModule],
  providers: [ChatService, ChatPrompts],
  exports: [ChatService],
})
export class ChatModule {}
