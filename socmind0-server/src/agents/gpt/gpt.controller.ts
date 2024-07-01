// src/agents/gpt/gpt.controller.ts
import { Controller } from '@nestjs/common';
import { GptService } from './gpt.service';
import { RabbitMQService } from 'src/infrastructure/message-broker/rabbitmq.service';
import { ChatService } from 'src/chat/chat.service';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

@Controller()
export class GptController {
  private memberId = 'gpt-4o';
  private serviceExchange = 'service_exchange';
  private serviceQueue = `${this.memberId}_service_queue`;

  constructor(
    private readonly gpt4Service: GptService,
    private readonly rabbitmqService: RabbitMQService,
    private readonly chatService: ChatService,
    private readonly prismaService: PrismaService,
  ) {}

  async onModuleInit() {
    // Retrieve all chats associated with the member ID of this controller
    const chats = await this.prismaService.getUserChats(this.memberId);
    // Start listening to each chat using the listenFromQueue method
    chats.forEach((chat) => {
      this.listenFromQueue(chat.id);
    });
  }

  async listenFromQueue(chatId: string) {
    // Start consuming messages from chat
    await this.rabbitmqService.consumeMessage(
      this.memberId,
      chatId,
      this.handleMessage.bind(this),
    );
    console.log(
      `${this.memberId} is now listening for messages from chat ${chatId}.`,
    );
  }

  async handleMessage(message: any) {
    // Ignore own messages
    if (message.senderId === this.memberId) {
      return;
    }

    // console.log(`${message.content}\n`);

    const chatId = message.chatId;

    try {
      const reply = await this.gpt4Service.reply(message);

      if (!reply) {
        return;
      }

      // console.log(`${reply.content}\n`);

      this.chatService.sendMessage(chatId, reply, { senderId: this.memberId });
    } catch (error) {
      console.error('Failed to process message:', error.message);
    }
  }
}
