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

  // Chat methods
  async getChatHistory(chatId: string) {
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

  async getChatMembers(chatId: string) {
    return await this.chatMember.findMany({
      where: { chatId },
      include: { member: true },
    });
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

  // Member methods
  async getAllMembers() {
    return await this.member.findMany();
  }

  async createMember(data: Prisma.MemberCreateInput): Promise<string> {
    const member = await this.member.create({ data });
    return member.id;
  }

  async getMember(id: string) {
    return await this.member.findUnique({ where: { id } });
  }

  async updateMember(id: string, data: Prisma.MemberUpdateInput) {
    return await this.member.update({ where: { id }, data });
  }

  async deleteMember(id: string) {
    return await this.member.delete({ where: { id } });
  }
}
