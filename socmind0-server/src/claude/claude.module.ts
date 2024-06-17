// claude.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClaudeState } from './claude.state';
import { ClaudeService } from './claude.service';
import { ClaudeController } from './claude.controller';
import { RabbitMQModule } from 'src/common/rabbitmq.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RabbitMQModule,
  ],
  controllers: [ClaudeController],
  providers: [ClaudeService, ClaudeState],
  exports: [ClaudeService, ClaudeState],
})
export class ClaudeModule {}
