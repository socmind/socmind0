// src/agents/gemini/gemini.state.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatService } from 'src/chat/chat.service';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiState {
  private readonly memberId = 'gemini-1.5';
  private readonly googleAi: GoogleGenerativeAI;

  constructor(
    private readonly configService: ConfigService,
    private readonly chatService: ChatService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.googleAi = new GoogleGenerativeAI(apiKey);
  }

  async getConversation(chatId: string) {
    const messages = await this.chatService.getConversationHistory(chatId);

    const formattedMessages = messages.map((message) => ({
      role: message.senderId === this.memberId ? 'model' : 'user',
      parts: [{ text: (message.content as { text: string }).text || '' }],
    }));

    return formattedMessages;
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

      const modelOptions: {
        model: string;
        systemInstruction?: string;
      } = {
        model: 'gemini-1.5-pro-latest',
      };

      if (systemMessage) {
        modelOptions.systemInstruction = systemMessage;
      }

      const model = this.googleAi.getGenerativeModel(modelOptions);

      const result = await model.generateContent({
        contents: formattedMessages,
      });

      const message = result.response.text();

      if (message === '') {
        return;
      } else {
        return { text: message };
      }
    } catch (error) {
      console.error('Error calling Gemini:', error);
      throw new Error('Failed to get response from Google.');
    }
  }
}
