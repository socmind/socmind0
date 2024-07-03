import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { PrismaModule } from 'src/infrastructure/database/prisma.module';
import { RabbitMQModule } from 'src/infrastructure/message-broker/rabbitmq.module';

@Module({
  imports: [PrismaModule, RabbitMQModule],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
