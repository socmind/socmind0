// src/user/user.service.ts
import { Injectable } from '@nestjs/common';
import { Message } from '@prisma/client';
import { ChatService } from 'src/chat/chat.service';
import { AppGateway } from 'src/gateway/app.gateway';

@Injectable()
export class UserService {
  private readonly memberId = 'flynn';

  constructor(
    private readonly chatService: ChatService,
    private readonly appGateway: AppGateway,
  ) { }

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

  async handleMessage(message: Message) {
    if (message.senderId === this.memberId) {
      return;
    }

    this.appGateway.sendMessageToUser(message);
  }

  async handleServiceMessage(message: any) {
    if (message.notification == 'NEW_CHAT' && message.chatId) {
      await this.chatService.initQueueConsumption(
        this.memberId,
        message.chatId,
        this.handleMessage.bind(this),
      );

      await this.appGateway.sendNewChatToUser(message.chatId);

      console.log(
        `Queue to chat ${message.chatId} initialized for member ${this.memberId}.`,
      );
    }
  }
}
