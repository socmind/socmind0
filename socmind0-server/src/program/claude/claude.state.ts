// src/program/claude/claude.state.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatService } from 'src/chat/chat.service';
import Anthropic from '@anthropic-ai/sdk';

@Injectable()
export class ClaudeState {
  private readonly memberId = 'claude-3.5';
  private readonly anthropic: Anthropic;

  constructor(
    private readonly configService: ConfigService,
    private readonly chatService: ChatService,
  ) {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    this.anthropic = new Anthropic({ apiKey });
  }

  private alternateRoles(
    messages: {
      role: string;
      content: string;
    }[],
  ) {
    if (messages.length === 0) return [];

    const result = [messages[0]];

    for (let i = 1; i < messages.length; i++) {
      const currentMessage = messages[i];
      const lastResultMessage = result[result.length - 1];

      if (currentMessage.role === lastResultMessage.role) {
        lastResultMessage.content += '\n' + currentMessage.content;
      } else {
        result.push(currentMessage);
      }
    }

    return result;
  }

  async getConversation(chatId: string) {
    const messages = await this.chatService.getConversationHistory(chatId);

    const formattedMessages = messages.map((message) => ({
      role: message.senderId === this.memberId ? 'assistant' : 'user',
      content: (message.content as { text: string }).text,
    }));

    return this.alternateRoles(formattedMessages);
  }

  async getSystemMessage() {
    const memberMetadata = await this.chatService.getMemberMetadata(
      this.memberId,
    );
    const systemMessage = memberMetadata.systemMessage;

    return systemMessage;
  }

  async reply(chatId: string) {
    try {
      const formattedMessages = await this.getConversation(chatId);
      const systemMessage = await this.getSystemMessage();

      if (
        formattedMessages.length > 0 &&
        formattedMessages[formattedMessages.length - 1].role === 'assistant'
      ) {
        return;
      }

      const requestBody: {
        model: string;
        messages: any;
        max_tokens: number;
        system?: string;
      } = {
        model: 'claude-3-5-sonnet-20240620',
        messages: formattedMessages,
        max_tokens: 1024,
      };

      if (systemMessage) {
        requestBody.system = systemMessage;
      }

      const response = await this.anthropic.messages.create(requestBody);

      let text = '';
      const contentBlock = response.content[0];
      if (contentBlock.type === 'text') {
        text += contentBlock.text;
      } else {
        text += `Calling tool '${contentBlock.name}' with input '${JSON.stringify(contentBlock.input)}'.`;
      }

      if (text.trim() === '') {
        return;
      } else {
        return { text: text };
      }
    } catch (error) {
      console.error('Error calling Anthropic:', error);
      throw new Error('Failed to get response from Claude.');
    }
  }
}
