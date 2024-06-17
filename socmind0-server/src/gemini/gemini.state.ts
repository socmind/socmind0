// gemini.state.ts
import {
  ChatSession,
  Content,
  GenerativeModel,
  GoogleGenerativeAI,
} from '@google/generative-ai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GeminiState {
  private googleAi: GoogleGenerativeAI;
  private model: GenerativeModel;
  private chat: ChatSession;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.googleAi = new GoogleGenerativeAI(apiKey);

    this.model = this.googleAi.getGenerativeModel({
      model: 'gemini-1.5-pro-latest',
      systemInstruction: `Your name is George. You are in a multi-speaker conversation.
      Prepend "George: " to all of your replies, so that conversants know who is speaking.
      You don't need to reply to every message.
      If you deem that nothing needs to be said, reply with just the empty string, without "George: " prepended.`,
    });

    this.chat = this.model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 100,
      },
    });
  }

  getChat(): ChatSession {
    return this.chat;
  }

  async getMemory(): Promise<Content[]> {
    return await this.chat.getHistory();
  }
}
