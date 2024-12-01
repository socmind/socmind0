import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatAdmin } from './chat.admin';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService
  ) { }

  @Get('members')
  async getAllMembers() {
    return this.chatService.getAllMembers();
  }

  @Post('create')
  async createChat(
    @Body() chatData: {
      memberIds: string[],
      name?: string,
      topic?: string,
      creator?: string,
      context?: string
    }
  ) {
    return this.chatService.createChat(
      chatData.memberIds,
      chatData.name,
      chatData.topic,
      chatData.creator,
      chatData.context
    );
  }
}
