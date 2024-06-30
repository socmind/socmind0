import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { RabbitMQService } from 'src/infrastructure/message-broker/rabbitmq.service';

@Module({
  providers: [ChatService, PrismaService, RabbitMQService],
  exports: [ChatService],
})
export class ChatModule {}
