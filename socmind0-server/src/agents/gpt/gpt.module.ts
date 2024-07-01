// gpt.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GptState } from './gpt.state';
import { GptService } from './gpt.service';
import { GptController } from './gpt.controller';
import { RabbitMQModule } from 'src/infrastructure/message-broker/rabbitmq.module';
import { PrismaModule } from 'src/infrastructure/database/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RabbitMQModule,
    PrismaModule,
  ],
  controllers: [GptController],
  providers: [GptService, GptState],
  exports: [GptService, GptState],
})
export class GptModule {}
