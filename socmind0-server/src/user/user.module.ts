// src/user/user.module.ts
import { Module } from '@nestjs/common';
import { ChatModule } from 'src/chat/chat.module';
import { UserService } from './user.service';
import { UserGateway } from './user.gateway';

@Module({
  imports: [ChatModule],
  providers: [UserService, UserGateway],
})
export class UserModule {}
