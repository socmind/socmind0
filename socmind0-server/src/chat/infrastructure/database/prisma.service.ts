// src/infrastructure/database/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, Prisma, Message } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super();
  }

  async onModuleInit() {
    await this.$connect();
    console.log('Prisma Client connected to database.');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('Prisma Client disconnected from database.');
  }

  // Chat methods
  async getAllChats() {
    return await this.chat.findMany({
      include: { members: true },
    });
  }

  async getAllChatsWithLastMessage() {
    const chats = await this.chat.findMany({
      include: {
        members: {
          select: {
            memberId: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });

    return chats.map((chat) => ({
      id: chat.id,
      name: chat.name as string | null,
      context: chat.context as string | null,
      creator: chat.creator as string | null,
      topic: chat.topic as string | null,
      conclusion: chat.conclusion as string | null,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      memberIds: chat.members.map((member) => member.memberId),
      latestMessage: (chat.messages[0] ?? null) as Message | null,
    }));
  }

  async getChat(id: string) {
    return await this.chat.findUnique({
      where: { id },
    });
  }

  async getChatWithMembers(id: string) {
    return await this.chat.findUnique({
      where: { id },
      include: { members: true },
    });
  }

  async getChatHistory(chatId: string): Promise<Message[]> {
    const messages = await this.message.findMany({
      where: {
        chatId: chatId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return messages;
  }

  async getMemberChats(memberId: string) {
    return await this.chat.findMany({
      where: {
        members: {
          some: {
            memberId: memberId,
          },
        },
      },
    });
  }

  async createChat(data: Prisma.ChatCreateInput) {
    const chat = await this.chat.create({ data });
    return chat;
  }

  async updateChat(id: string, data: Prisma.ChatUpdateInput) {
    return await this.chat.update({ where: { id }, data });
  }

  async createMessage(data: Prisma.MessageCreateInput) {
    const message = await this.message.create({ data });
    return message;
  }

  // ChatMember methods
  async getChatMembers(chatId: string) {
    return await this.chatMember.findMany({
      where: { chatId },
      include: { member: true },
    });
  }

  async createChatMember(
    chatId: string,
    memberId: string,
    chatInstructions?: string,
  ) {
    const chatMember = await this.chatMember.create({
      data: {
        chat: { connect: { id: chatId } },
        member: { connect: { id: memberId } },
        chatInstructions,
      },
    });

    return chatMember;
  }

  async updateChatMember(
    chatId: string,
    memberId: string,
    chatInstructions: string,
  ) {
    return await this.chatMember.update({
      where: {
        memberId_chatId: {
          memberId: memberId,
          chatId: chatId,
        },
      },
      data: {
        chatInstructions: chatInstructions,
      },
    });
  }

  // Member methods
  async getAllMembers() {
    return await this.member.findMany();
  }

  async createMember(data: Prisma.MemberCreateInput) {
    const member = await this.member.create({ data });
    return member;
  }

  async getMember(id: string) {
    return await this.member.findUnique({
      where: { id },
      include: { chats: true },
    });
  }

  async updateMember(id: string, data: Prisma.MemberUpdateInput) {
    return await this.member.update({ where: { id }, data });
  }

  async deleteMember(id: string) {
    return await this.member.delete({ where: { id } });
  }
}
