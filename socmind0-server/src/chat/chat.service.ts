// src/chat/chat.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { RabbitMQService } from '../infrastructure/message-broker/rabbitmq.service';
import { MessageType, Prisma } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(
    private prismaService: PrismaService,
    private rabbitMQService: RabbitMQService,
  ) {}

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
    const messageType: MessageType = senderId ? 'MEMBER' : 'SYSTEM';

    // Create the message data
    const messageData: Prisma.MessageCreateInput = {
      chat: { connect: { id: chatId } },
      content: JSON.stringify(content),
      type: messageType,
    };

    // If senderId is provided, add it to the message data
    if (senderId) {
      messageData.sender = { connect: { id: senderId } };
    }

    const rabbitMQMessage = {
      content,
      messageType,
      ...(senderId && { senderId }),
    };

    const executeOperations = async (prisma: Prisma.TransactionClient) => {
      const message = await prisma.message.create({
        data: messageData,
      });

      try {
        await this.rabbitMQService.sendMessage(chatId, rabbitMQMessage);
      } catch (error) {
        // Log the error and potentially implement a retry mechanism
        console.error('Failed to send message to RabbitMQ:', error);
        throw error; // Re-throw to trigger transaction rollback
      }

      return message.id;
    };

    if (prismaTransaction) {
      return executeOperations(prismaTransaction);
    } else {
      return this.prismaService.$transaction(executeOperations);
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
    // Start a transaction to ensure database consistency
    await this.prismaService.$transaction(async (prisma) => {
      // 1. Add the member to the chat in the database
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

      // 2. Set up RabbitMQ queue for the new member
      await this.rabbitMQService.createOrAddMembersToGroupChat(chatId, [
        memberId,
      ]);

      // 3. Use sendMessage to create a system message announcing the new member
      await this.sendMessage(
        chatId,
        { text: `${chatMember.member.name} has joined the chat.` },
        { prismaTransaction: prisma },
      );
    });
  }

  async getChatMessages(chatId: string, limit: number = 50, cursor?: string) {
    return this.prismaService.getMessagesForChat(chatId, limit, cursor);
  }
}
