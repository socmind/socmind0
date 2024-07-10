// src/user/user.service.ts
import { Injectable } from '@nestjs/common';
import { ChatService } from 'src/chat/chat.service';
import { UserGateway } from './user.gateway';

@Injectable()
export class UserService {
  private readonly memberId = 'flynn';

  constructor(
    private readonly chatService: ChatService,
    private readonly userGateway: UserGateway,
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

    // Emit the received message to the connected client
    this.userGateway.sendMessageToUser(this.memberId, chatId, message);
  }

  async handleServiceMessage(message: any) {
    if (message.notification == 'NEW_CHAT' && message.chatId) {
      await this.chatService.initQueueConsumption(
        this.memberId,
        message.chatId,
        this.handleMessage.bind(this),
      );

      this.userGateway.notifyNewChat(this.memberId, message.chatId);

      console.log(
        `Queue to chat ${message.chatId} initialized for member ${this.memberId}.`,
      );
    }
  }
}
