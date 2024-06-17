// gemini.service.ts
import { Injectable } from '@nestjs/common';
import { GeminiState } from './gemini.state';

@Injectable()
export class GeminiService {
  constructor(private readonly geminiState: GeminiState) {}

  async reply(message: any): Promise<any> {
    try {
      const chat = this.geminiState.getChat();
      if (message.content) {
        const result = await chat.sendMessage(message.content);
        const text = result.response.text();
        if (text === '') {
          return;
        } else {
          // const history = await this.geminiState.getMemory();
          // console.log(JSON.stringify(history, null, 2));
          return { role: 'user', content: text };
        }
      } else {
        throw new Error('Gemini error: content field missing from message.');
      }
    } catch (error) {
      console.error('Error calling Gemini:', error);
      throw new Error('Failed to get response from Gemini.');
    }
  }
}
