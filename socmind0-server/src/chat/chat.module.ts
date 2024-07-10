import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { PrismaModule } from 'src/chat/infrastructure/database/prisma.module';
import { RabbitMQModule } from 'src/chat/infrastructure/message-broker/rabbitmq.module';
import { PrismaService } from './infrastructure/database/prisma.service';

@Module({
  imports: [PrismaModule, RabbitMQModule],
  providers: [ChatService],
  exports: [ChatService, PrismaService],
})
export class ChatModule {}
