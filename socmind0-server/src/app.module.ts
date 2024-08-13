// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './chat/infrastructure/database/prisma.module';
import { RabbitMQModule } from './chat/infrastructure/message-broker/rabbitmq.module';
import { ChatModule } from './chat/chat.module';
import { GatewayModule } from './gateway/gateway.module';
import { UserModule } from './user/user.module';
import { ProgramModule } from './program/program.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    RabbitMQModule,
    ChatModule,
    GatewayModule,
    UserModule,
    ProgramModule,
  ],
})
export class AppModule {}
