// src/infrastructure/database/prisma.service.ts
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  async createChat(memberIds: string[]) {
    return this.prisma.chat.create({
      data: {
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
    return this.prisma.message.findMany({
      where: { chatId },
      include: { sender: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async addMemberToChat(chatId: string, memberId: string) {
    return this.prisma.chatMember.create({
      data: {
        chat: { connect: { id: chatId } },
        member: { connect: { id: memberId } },
      },
    });
  }

  async createMessage(content: any, senderId: string, chatId: string) {
    return this.prisma.message.create({
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
