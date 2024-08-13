// src/user/user.module.ts
import { Module } from '@nestjs/common';
import { ChatModule } from 'src/chat/chat.module';
import { GatewayModule } from 'src/gateway/gateway.module';
import { UserService } from './user.service';

@Module({
  imports: [ChatModule, GatewayModule],
  providers: [UserService],
})
export class UserModule {}
