// src/database/prisma.service.ts
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

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
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async createChat(name: string, memberIds: string[]) {
    return this.chat.create({
      data: {
        name,
        members: {
          create: memberIds.map((memberId) => ({
            member: { connect: { id: memberId } },
          })),
        },
      },
      include: { members: true },
    });
  }

  async getChatMessages(chatId: string) {
    return this.message.findMany({
      where: { chatId },
      include: { sender: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async addMemberToChat(chatId: string, memberId: string) {
    return this.chatMember.create({
      data: {
        chat: { connect: { id: chatId } },
        member: { connect: { id: memberId } },
      },
    });
  }

  async createMessage(content: any, senderId: string, chatId: string) {
    return this.message.create({
      data: {
        content,
        sender: { connect: { id: senderId } },
        chat: { connect: { id: chatId } },
      },
      include: { sender: true },
    });
  }

  // Add more methods as needed...
}
