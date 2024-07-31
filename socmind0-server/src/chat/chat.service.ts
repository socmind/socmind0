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
  async sendMessage(chatId: string, content: any, senderId?: string) {
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

      return message;
    };

    return this.prismaService.$transaction(execute);
  }

  async createGroupChat(memberIds: string[], name?: string, context?: string) {
    const chatData: Prisma.ChatCreateInput = {
      members: {
        create: memberIds.map((memberId) => ({
          member: { connect: { id: memberId } },
        })),
      },
    };

    if (name) {
      chatData.name = name;
    }

    const chat = await this.prismaService.createChat(chatData);

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

    if (context) {
      await this.setChatContext(chat.id, context);
    }

    return chat;
  }

  async addMemberToChat(
    chatId: string,
    memberId: string,
    chatInstructions?: string,
  ) {
    const chatMember = await this.prismaService.createChatMember(
      chatId,
      memberId,
      chatInstructions,
    );

    await this.rabbitMQService.createOrAddMembersToGroupChat(chatId, [
      memberId,
    ]);

    await this.rabbitMQService.createMemberServiceQueue(memberId);

    await this.rabbitMQService.sendServiceMessage(memberId, {
      notification: 'NEW_CHAT',
      chatId: chatId,
    });

    await this.sendMessage(chatId, {
      text: `${chatMember.memberId} has joined the chat.`,
    });

    return chatMember;
  }

  async setChatContext(chatId: string, context: string) {
    try {
      const updatedChat = await this.prismaService.updateChat(chatId, {
        context: context,
      });
      await this.sendMessage(chatId, context);
      return updatedChat;
    } catch (error) {
      throw new Error(`Failed to set chat context: ${error.message}`);
    }
  }

  async setChatConclusion(chatId: string, conclusion: string) {
    try {
      const updatedChat = await this.prismaService.updateChat(chatId, {
        conclusion: conclusion,
      });
      const msg = { text: `Consensus reached: ${conclusion}.` };
      await this.sendMessage(chatId, msg);
      return updatedChat;
    } catch (error) {
      throw new Error(`Failed to set chat conclusion: ${error.message}`);
    }
  }

  // Message broker methods
  async createServiceQueues() {
    await this.rabbitMQService.createServiceExchange();

    const members = await this.getAllMembers();
    const serviceQueueCreationPromises = members.map((member) =>
      this.rabbitMQService.createMemberServiceQueue(member.id),
    );
    await Promise.all(serviceQueueCreationPromises);

    console.log('Service queues created for all existing members.');
  }

  async initServiceQueueConsumption(
    memberId: string,
    serviceMessageHandler: (message: any) => void,
  ) {
    await this.rabbitMQService.consumeServiceMessage(
      memberId,
      serviceMessageHandler,
    );

    console.log(`${memberId} listening to service exchange.`);
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
  async getAllMembers() {
    const members = await this.prismaService.getAllMembers();
    return members;
  }

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
