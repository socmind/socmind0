// gpt.state.ts
import { Injectable } from '@nestjs/common';
import { ChatService } from 'src/chat/chat.service';

@Injectable()
export class GptState {
  private readonly memberId = 'gpt-4o';

  constructor(private readonly chatService: ChatService) {}

  private memory: any[] = [
    {
      role: 'system',
      content: `Your name is Charles.
      You are in a multi-speaker conversation.
      Prepend "Charles: " to all of your replies, so that conversants know who is speaking.
      You don't need to reply to every message.
      If you deem that nothing needs to be said, reply with just the empty string, without "Charles: " prepended.`,
    },
  ];

  async getConversation(chatId: string): Promise<any[]> {
    const messages = await this.chatService.getConversationHistory(chatId);
    const formattedMessages = messages.map((message) => ({
      role:
        message.type === 'SYSTEM'
          ? 'system'
          : message.sender?.id === this.memberId
            ? 'assistant'
            : 'user',
      content: (message.content as any).text ?? '',
    }));

    return formattedMessages;
  }
}
