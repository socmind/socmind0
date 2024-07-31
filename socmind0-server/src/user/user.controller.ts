// src/user/user.controller.ts
import { Controller, Get, Logger, Param } from '@nestjs/common';
import { ChatService } from '../chat/chat.service';

@Controller('api/user')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly chatService: ChatService) {}

  @Get(':userId/chats')
  async getUserChats(@Param('userId') userId: string) {
    this.logger.log(`Fetching chats for user: ${userId}`);
    const chats = await this.chatService.getMemberChats(userId);
    this.logger.log(`Found ${chats.length} chats for user: ${userId}`);
    return chats;
  }
}
