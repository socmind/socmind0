// src/agents/claude/claude.service.ts
import { Injectable } from '@nestjs/common';
import { ChatService } from 'src/chat/chat.service';
import { ClaudeState } from './claude.state';

@Injectable()
export class ClaudeService {
  private readonly memberId = 'claude-3.5';

  constructor(
    private readonly chatService: ChatService,
    private readonly claudeState: ClaudeState,
  ) {}

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

  async handleMessage(message: any) {
    if (message.senderId === this.memberId) {
      return;
    }

    const chatId = message.chatId;

    try {
      const reply = await this.claudeState.reply(chatId);

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
