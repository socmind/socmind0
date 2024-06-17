// gpt.service.ts
import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import { GptState } from './gpt.state';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GptService {
  private openAi: OpenAI;

  constructor(
    private readonly gptState: GptState,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.openAi = new OpenAI({ apiKey });
  }

  async reply(rawMessage: any): Promise<any> {
    try {
      this.gptState.transformAndAddMessage(rawMessage);

      const response = await this.openAi.chat.completions.create({
        model: 'gpt-4o',
        messages: this.gptState.getFormattedMessages(),
      });

      if (response.choices.length > 0) {
        const message = response.choices[0].message;

        if (message.content === '') {
          return;
        } else {
          this.gptState.addMessage(message);
          // console.log(this.gptState.getFormattedMessages());
          return { role: 'user', content: message.content };
        }
      } else {
        throw new Error('No content received from OpenAI.');
      }
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      throw new Error('Failed to get response from ChatGPT.');
    }
  }
}
