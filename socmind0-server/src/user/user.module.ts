// src/user/user.module.ts
import { Module } from '@nestjs/common';
import { ChatModule } from 'src/chat/chat.module';
import { UserService } from './user.service';
import { AppGateway } from 'src/app.gateway';

@Module({
  imports: [ChatModule],
  providers: [UserService, AppGateway],
})
export class UserModule {}
