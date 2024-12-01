// src/chat/chat.module.ts
import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatPrompts } from './chat.prompts';
import { PrismaModule } from 'src/chat/infrastructure/database/prisma.module';
import { RabbitMQModule } from 'src/chat/infrastructure/message-broker/rabbitmq.module';
import { ChatAdmin } from './chat.admin';
import { ChatController } from './chat.controller';

@Module({
  imports: [PrismaModule, RabbitMQModule],
  controllers: [ChatController],
  providers: [ChatService, ChatPrompts, ChatAdmin],
  exports: [ChatService, ChatAdmin],
})
export class ChatModule {}
