// src/user/user.module.ts
import { Module } from '@nestjs/common';
import { ChatModule } from 'src/chat/chat.module';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AppGateway } from 'src/app.gateway';

@Module({
  imports: [ChatModule],
  providers: [UserService, AppGateway],
  controllers: [UserController],
})
export class UserModule {}
