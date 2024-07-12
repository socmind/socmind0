// src/infrastructure/database/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

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

  // Member methods
  async getAllMembers(): Promise<{ id: string }[]> {
    return this.member.findMany({
      select: {
        id: true,
      },
    });
  }

  async createMember(data: Prisma.MemberCreateInput): Promise<string> {
    const member = await this.member.create({ data });
    return member.id;
  }

  async getMember(id: string) {
    return this.member.findUnique({ where: { id } });
  }

  async updateMember(id: string, data: Prisma.MemberUpdateInput) {
    return this.member.update({ where: { id }, data });
  }

  async deleteMember(id: string) {
    return this.member.delete({ where: { id } });
  }

  // Chat methods
  async createChat(data: Prisma.ChatCreateInput): Promise<string> {
    const chat = await this.chat.create({ data });
    return chat.id;
  }

  async getChatMetadata(id: string) {
    return this.chat.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            member: {
              select: {
                id: true,
                name: true,
                // Add any other member fields you want to include
              },
            },
          },
        },
        _count: {
          select: { messages: true },
        },
      },
    });
  }

  async updateChat(id: string, data: Prisma.ChatUpdateInput) {
    return this.chat.update({ where: { id }, data });
  }

  async deleteChat(id: string) {
    return this.chat.delete({ where: { id } });
  }

  // ChatMember methods
  async addMemberToChat(
    chatId: string,
    memberId: string,
    chatInstructions?: string,
  ): Promise<string> {
    const chatMember = await this.chatMember.create({
      data: {
        chat: { connect: { id: chatId } },
        member: { connect: { id: memberId } },
        chatInstructions,
      },
    });
    return chatMember.id;
  }

  async removeMemberFromChat(chatId: string, memberId: string) {
    return this.chatMember.delete({
      where: {
        memberId_chatId: {
          memberId,
          chatId,
        },
      },
    });
  }

  // Message methods
  async createMessage(data: Prisma.MessageCreateInput): Promise<string> {
    const message = await this.message.create({ data });
    return message.id;
  }

  async getRecentMessagesForChat(
    chatId: string,
    limit: number = 50,
    cursor?: string,
  ) {
    return this.message.findMany({
      where: { chatId },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { sender: true },
    });
  }

  // Utility methods
  async getChatMembers(chatId: string) {
    return this.chatMember.findMany({
      where: { chatId },
      include: { member: true },
    });
  }

  async getUserChats(memberId: string) {
    return this.chat.findMany({
      where: {
        members: {
          some: {
            memberId: memberId,
          },
        },
      },
    });
  }

  async getChatHistory(chatId: string) {
    const messages = await this.message.findMany({
      where: {
        chatId: chatId,
      },
      include: {
        sender: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return messages;
  }
}
