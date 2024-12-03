import { Controller, Get, Post, Body } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService
  ) { }

  @Get('members')
  async getAllMembers() {
    const members = await this.chatService.getAllMembers();
    return members;
  }

  @Post('create')
  async createChat(@Body() chatData: any) {
    const newChat = await this.chatService.createChat(
      chatData.memberIds,
      chatData.name,
      chatData.topic,
      chatData.creator,
      chatData.context
    );

    // Transform to match client interface
    return {
      memberIds: chatData.memberIds,
      id: newChat.id,
      name: newChat.name as string | null,
      context: newChat.context as string | null,
      creator: newChat.creator as string | null,
      topic: newChat.topic as string | null,
      conclusion: newChat.conclusion as string | null,
      createdAt: newChat.createdAt,
      updatedAt: newChat.updatedAt,
    };
  }
}
