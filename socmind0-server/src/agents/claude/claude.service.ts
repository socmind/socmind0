// claude.service.ts
import { Injectable } from '@nestjs/common';
import { ClaudeState } from './claude.state';
import Anthropic from '@anthropic-ai/sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ClaudeService {
  private anthropic: Anthropic;

  constructor(
    private readonly claudeState: ClaudeState,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    this.anthropic = new Anthropic({ apiKey });
  }

  async reply(message: any): Promise<any> {
    try {
      this.claudeState.transformAndAddMessage(message);

      const response = await this.anthropic.messages.create({
        max_tokens: 1024,
        system: this.claudeState.getSystemPrompt(),
        messages: this.claudeState.getFormattedMessages(),
        model: 'claude-3-opus-20240229',
      });

      // const text = response.content[0].text;

      let text = '';
      const contentBlock = response.content[0];

      if (contentBlock.type === 'text') {
        text += contentBlock.text;
      } else {
        text += `Calling tool '${contentBlock.name}' with input '${JSON.stringify(contentBlock.input)}'.`;
      }

      if (text === '') {
        return;
      } else {
        this.claudeState.addMessage(response);
        // console.log(this.claudeState.getFormattedMessages());
        return { role: 'user', content: text };
      }
    } catch (error) {
      console.error('Error calling Anthropic:', error);
      throw new Error('Failed to get response from Claude.');
    }
  }
}
