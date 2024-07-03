import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { PrismaModule } from 'src/infrastructure/database/prisma.module';
import { RabbitMQModule } from 'src/infrastructure/message-broker/rabbitmq.module';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [PrismaModule, RabbitMQModule],
  providers: [ChatService, ChatGateway],
  exports: [ChatService, ChatGateway],
})
export class ChatModule {}
