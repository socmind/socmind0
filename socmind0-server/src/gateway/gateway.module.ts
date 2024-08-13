// src/gateway/app.gateway.ts
import { Module } from '@nestjs/common';
import { ChatModule } from 'src/chat/chat.module';
import { AppGateway } from './app.gateway';

@Module({
  imports: [ChatModule],
  providers: [AppGateway],
  exports: [AppGateway],
})
export class GatewayModule {}
