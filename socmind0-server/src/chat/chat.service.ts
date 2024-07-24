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

  async sendMessage(
    chatId: string,
    content: any,
    options?: {
      senderId?: string;
      prismaTransaction?: Prisma.TransactionClient;
    },
  ): Promise<string> {
    const { senderId, prismaTransaction } = options || {};

    // Determine the message type based on the presence of senderId
    const type: MessageType = senderId ? 'MEMBER' : 'SYSTEM';

    // Create the message data
    const messageData: Prisma.MessageCreateInput = {
      chat: { connect: { id: chatId } },
      content: content,
      type: type,
    };

    // If senderId is provided, add it to the message data
    if (senderId) {
      // Check if the Member exists before connecting
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
        await this.rabbitMQService.sendMessage(chatId, rabbitMQMessage);
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
    // Start a transaction to ensure database consistency
    return this.prismaService.$transaction(async (prisma) => {
      // Prepare the chat data
      const chatData: Prisma.ChatCreateInput = {
        members: {
          create: memberIds.map((memberId) => ({
            member: { connect: { id: memberId } },
          })),
        },
      };

      // Only add name and context if they are provided
      if (name !== undefined) {
        chatData.name = name;
      }
      if (context !== undefined) {
        chatData.context = context;
      }

      // Create the chat in the database
      const chat = await prisma.chat.create({
        data: chatData,
        include: {
          members: true,
        },
      });

      // Set up RabbitMQ exchange and queues for the chat
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

  async addMemberToChat(
    chatId: string,
    memberId: string,
    chatInstructions?: string,
  ): Promise<void> {
    // Start a transaction to ensure database consistency
    await this.prismaService.$transaction(async (prisma) => {
      // Add the member to the chat in the database
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

      // Set up RabbitMQ queue for the new member
      await this.rabbitMQService.createOrAddMembersToGroupChat(chatId, [
        memberId,
      ]);

      // Create service queue for the new member if it doesn't exist
      await this.rabbitMQService.createMemberServiceQueue(memberId);

      // Use sendMessage to create a system message announcing the new member
      await this.sendMessage(
        chatId,
        { text: `${chatMember.member.name} has joined the chat.` },
        { prismaTransaction: prisma },
      );
    });
  }

  async createServiceQueues() {
    await this.rabbitMQService.createServiceExchange();

    const members = await this.prismaService.getAllMembers();
    const serviceQueueCreationPromises = members.map((member) =>
      this.rabbitMQService.createMemberServiceQueue(member.id),
    );
    await Promise.all(serviceQueueCreationPromises);

    console.log('Service queues initialized for all existing members.');
  }

  async getMemberChats(memberId: string) {
    const chats = await this.prismaService.getMemberChats(memberId);
    return chats;
  }

  async getChatMetadata(chatId: string) {
    const chatMetadata = await this.prismaService.getChatMetadata(chatId);
    return chatMetadata;
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
