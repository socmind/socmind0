// src/agents/gpt/gpt.state.ts
import { Injectable } from '@nestjs/common';
import { ChatService } from 'src/chat/chat.service';

@Injectable()
export class GptState {
  private readonly memberId = 'gpt-4o';

  constructor(private readonly chatService: ChatService) {}

  async getConversation(chatId: string): Promise<any[]> {
    const messages = await this.chatService.getConversationHistory(chatId);
    const memberMetadata = await this.chatService.getMemberMetadata(
      this.memberId,
    );

    const formattedMessages = messages.map((message) => ({
      role: this.determineMessageRole(message),
      content: (message.content as any).text ?? '',
    }));

    if (memberMetadata.systemMessage) {
      formattedMessages.unshift({
        role: 'system',
        content: memberMetadata.systemMessage,
      });
    }

    return formattedMessages;
  }

  private determineMessageRole(message: any): 'system' | 'assistant' | 'user' {
    if (message.type === 'SYSTEM') return 'system';
    return message.sender?.id === this.memberId ? 'assistant' : 'user';
  }
}
