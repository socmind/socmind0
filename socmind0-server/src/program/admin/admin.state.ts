// src/program/admin/admin.state.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatService } from 'src/chat/chat.service';
import OpenAI from 'openai';

@Injectable()
export class AdminState {
  private readonly memberId = 'admin';
  private readonly openAi: OpenAI;
  private readonly createChatPrompt = 'create chat';
  private readonly conclusionPrompt = 'conclusion';

  constructor(
    private readonly configService: ConfigService,
    private readonly chatService: ChatService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.openAi = new OpenAI({ apiKey });
  }

  private determineMessageRole(message: any): 'system' | 'assistant' | 'user' {
    if (message.type === 'SYSTEM') return 'system';
    return message.senderId === this.memberId ? 'assistant' : 'user';
  }

  async getConversation(chatId: string) {
    const messages = await this.chatService.getConversationHistory(chatId);
    const memberMetadata = await this.chatService.getMemberMetadata(
      this.memberId,
    );
    const systemMessage = memberMetadata.systemMessage;
    const chatMember = memberMetadata.chats.find(
      (chat) => chat.chatId === chatId,
    );
    const chatInstructions = chatMember?.chatInstructions;

    const formattedMessages = messages.map((message) => ({
      role: this.determineMessageRole(message),
      content: (message.content as { text: string }).text ?? '',
    }));

    const combinedInstructions = [systemMessage, chatInstructions]
      .filter(Boolean)
      .join('\n');

    console.log(
      `Admin instructions for chat ${chatId}:\n\`\`\`\n${combinedInstructions}.\n\`\`\``,
    );

    if (combinedInstructions) {
      formattedMessages.unshift({
        role: 'system',
        content: combinedInstructions,
      });
    }

    return formattedMessages;
  }

  async reply(chatId: string) {
    try {
      const formattedMessages = await this.getConversation(chatId);

      const response = await this.openAi.chat.completions.create({
        model: 'gpt-4o',
        messages: formattedMessages,
        response_format: { type: 'json_object' },
      });

      if (response.choices.length > 0) {
        const message = response.choices[0].message;
        console.log('Admin message: ', message.content);

        if (message.content.trim() === '') {
          return;
        }

        const messageObject = JSON.parse(message.content);

        if (messageObject.command === this.createChatPrompt) {
          const memberIds = messageObject.messageIds;
          const name = messageObject.name;
          const context = messageObject.instruction;
          const chat = await this.chatService.createGroupChat(
            memberIds,
            name,
            context,
          );
          return {
            text: `Chat ${chat.id} created with parameters ${message.content}.`,
          };
        } else {
          return;
        }
      } else {
        throw new Error('No content received from OpenAI.');
      }
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      throw new Error('Failed to get response from OpenAI.');
    }
  }
}
