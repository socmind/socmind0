// src/agents/gpt/gpt.service.ts
import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import { GptState } from './gpt.state';
import { ConfigService } from '@nestjs/config';
import { ChatService } from 'src/chat/chat.service';

@Injectable()
export class GptService {
  private readonly openAi: OpenAI;
  private readonly memberId = 'gpt-4o';

  constructor(
    private readonly configService: ConfigService,
    private readonly chatService: ChatService,
    private readonly gptState: GptState,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.openAi = new OpenAI({ apiKey });
  }

  async onModuleInit() {
    await this.chatService.initAllQueuesConsumption(
      this.memberId,
      this.handleMessage.bind(this),
    );

    await this.chatService.initServiceQueueConsumption(
      this.memberId,
      this.handleServiceMessage.bind(this),
    );
  }

  async reply(chatId: string): Promise<any> {
    try {
      const formattedMessages = await this.gptState.getConversation(chatId);

      const response = await this.openAi.chat.completions.create({
        model: 'gpt-4o',
        messages: formattedMessages,
      });

      if (response.choices.length > 0) {
        const message = response.choices[0].message;

        if (message.content === '') {
          return;
        } else {
          return { text: message.content };
        }
      } else {
        throw new Error('No content received from OpenAI.');
      }
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      throw new Error('Failed to get response from OpenAI.');
    }
  }

  async handleMessage(message: any) {
    if (message.senderId === this.memberId) {
      return;
    }

    const chatId = message.chatId;

    try {
      const reply = await this.reply(chatId);

      if (!reply) {
        return;
      }

      this.chatService.sendMessage(chatId, reply, { senderId: this.memberId });
    } catch (error) {
      console.error('Failed to process message:', error.message);
    }
  }

  async handleServiceMessage(message: any) {
    if (message.notification == 'NEW_CHAT' && message.chatId) {
      await this.chatService.initQueueConsumption(
        this.memberId,
        message.chatId,
        this.handleMessage.bind(this),
      );
      console.log(
        `Queue to chat ${message.chatId} initialized for member ${this.memberId}.`,
      );
    }
  }
}
