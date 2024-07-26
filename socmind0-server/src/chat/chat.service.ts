// src/chat/chat.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from 'src/chat/infrastructure/message-broker/rabbitmq.service';
import { PrismaService } from 'src/chat/infrastructure/database/prisma.service';
import { MessageType, Prisma } from '@prisma/client';

@Injectable()
export class ChatService implements OnModuleInit {
  constructor(
    private prismaService: PrismaService,
    private rabbitMQService: RabbitMQService,
  ) {}

  async onModuleInit() {
    await this.createServiceQueues();
  }

  // Main methods
  async sendMessage(
    chatId: string,
    content: any,
    options?: {
      senderId?: string;
      prismaTransaction?: Prisma.TransactionClient;
    },
  ): Promise<string> {
    const { senderId, prismaTransaction } = options || {};

    const type: MessageType = senderId ? 'MEMBER' : 'SYSTEM';

    const messageData: Prisma.MessageCreateInput = {
      chat: { connect: { id: chatId } },
      content: content,
      type: type,
    };

    if (senderId) {
      const memberExists = await this.prismaService.member.findUnique({
        where: { id: senderId },
      });
      if (!memberExists) {
        throw new Error(`Member with id ${senderId} not found.`);
      }
      messageData.sender = { connect: { id: senderId } };
    }

    const rabbitMQMessage = {
      content,
      type,
      chatId,
      ...(senderId && { senderId }),
    };

    const execute = async (prisma: Prisma.TransactionClient) => {
      const message = await prisma.message.create({
        data: messageData,
      });

      try {
        await this.rabbitMQService.sendMessage(rabbitMQMessage);
      } catch (error) {
        console.error('Failed to send message to RabbitMQ:', error);
        throw error;
      }

      return message.id;
    };

    if (prismaTransaction) {
      return execute(prismaTransaction);
    } else {
      return this.prismaService.$transaction(execute);
    }
  }

  async createGroupChat(
    memberIds: string[],
    name?: string,
    context?: string,
  ): Promise<string> {
    return this.prismaService.$transaction(async (prisma) => {
      const chatData: Prisma.ChatCreateInput = {
        members: {
          create: memberIds.map((memberId) => ({
            member: { connect: { id: memberId } },
          })),
        },
      };

      if (name !== undefined) {
        chatData.name = name;
      }
      if (context !== undefined) {
        chatData.context = context;
      }

      const chat = await prisma.chat.create({
        data: chatData,
        include: {
          members: true,
        },
      });

      await this.rabbitMQService.createOrAddMembersToGroupChat(
        chat.id,
        memberIds,
      );

      for (const memberId of memberIds) {
        await this.rabbitMQService.sendServiceMessage(memberId, {
          notification: 'NEW_CHAT',
          chatId: chat.id,
        });
      }

      console.log(`Chat ${chat.id} created.`);

      if (context !== undefined) {
        await this.sendMessage(
          chat.id,
          { text: context },
          { prismaTransaction: prisma },
        );
      }

      return chat.id;
    });
  }

  async addMemberToChat(
    chatId: string,
    memberId: string,
    chatInstructions?: string,
  ): Promise<void> {
    await this.prismaService.$transaction(async (prisma) => {
      const chatMember = await prisma.chatMember.create({
        data: {
          chat: { connect: { id: chatId } },
          member: { connect: { id: memberId } },
          chatInstructions,
        },
        include: {
          member: true,
          chat: true,
        },
      });

      await this.rabbitMQService.createOrAddMembersToGroupChat(chatId, [
        memberId,
      ]);

      await this.rabbitMQService.createMemberServiceQueue(memberId);

      await this.sendMessage(
        chatId,
        { text: `${chatMember.member.name} has joined the chat.` },
        { prismaTransaction: prisma },
      );
    });
  }

  // Message broker methods
  async createServiceQueues() {
    await this.rabbitMQService.createServiceExchange();

    const members = await this.prismaService.getAllMembers();
    const serviceQueueCreationPromises = members.map((member) =>
      this.rabbitMQService.createMemberServiceQueue(member.id),
    );
    await Promise.all(serviceQueueCreationPromises);

    console.log('Service queues initialized for all existing members.');
  }

  async initServiceQueueConsumption(
    memberId: string,
    serviceMessageHandler: (message: any) => void,
  ) {
    await this.rabbitMQService.consumeServiceMessage(
      memberId,
      serviceMessageHandler,
    );

    console.log(`Service queue initialized for member ${memberId}.`);
  }

  async initQueueConsumption(
    memberId: string,
    chatId: string,
    messageHandler: (message: any) => void,
  ) {
    await this.rabbitMQService.consumeMessages(
      memberId,
      chatId,
      messageHandler,
    );
  }

  async initAllQueuesConsumption(
    memberId: string,
    messageHandler: (message: any) => void,
  ) {
    const chats = await this.getMemberChats(memberId);

    const initializationPromises = chats.map((chat) =>
      this.initQueueConsumption(memberId, chat.id, messageHandler),
    );

    await Promise.all(initializationPromises);

    console.log(`Chat queues initialized for member ${memberId}.`);
  }

  // Database methods
  async getMemberChats(memberId: string) {
    const chats = await this.prismaService.getMemberChats(memberId);
    return chats;
  }

  async getMemberMetadata(memberId: string) {
    const memberMetadata = await this.prismaService.getMember(memberId);
    return memberMetadata;
  }

  async getConversationHistory(chatId: string) {
    const conversation = await this.prismaService.getChatHistory(chatId);
    return conversation;
  }
}
