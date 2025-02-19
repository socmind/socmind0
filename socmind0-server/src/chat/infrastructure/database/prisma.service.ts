// src/infrastructure/database/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, Prisma, Message } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient().$extends(
      withAccelerate(),
    ) as unknown as PrismaClient;
  }

  async onModuleInit() {
    await this.prisma.$connect();
    console.log('Prisma Client connected to database.');
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
    console.log('Prisma Client disconnected from database.');
  }

  // Expose the Prisma client
  get client() {
    return this.prisma;
  }

  // Chat methods
  async getAllChats() {
    return await this.prisma.chat.findMany({
      include: { members: true },
    });
  }

  async getAllChatsWithLastMessage() {
    const chats = await this.prisma.chat.findMany({
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
    return await this.prisma.chat.findUnique({
      where: { id },
    });
  }

  async getChatWithMembers(id: string) {
    return await this.prisma.chat.findUnique({
      where: { id },
      include: { members: true },
    });
  }

  async getChatHistory(chatId: string): Promise<Message[]> {
    const messages = await this.prisma.message.findMany({
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
    return await this.prisma.chat.findMany({
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
    const chat = await this.prisma.chat.create({ data });
    return chat;
  }

  async updateChat(id: string, data: Prisma.ChatUpdateInput) {
    return await this.prisma.chat.update({ where: { id }, data });
  }

  async createMessage(data: Prisma.MessageCreateInput) {
    const message = await this.prisma.message.create({ data });
    return message;
  }

  // ChatMember methods
  async getChatMembers(chatId: string) {
    return await this.prisma.chatMember.findMany({
      where: { chatId },
      include: { member: true },
    });
  }

  async createChatMember(
    chatId: string,
    memberId: string,
    chatInstructions?: string,
  ) {
    const chatMember = await this.prisma.chatMember.create({
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
    return await this.prisma.chatMember.update({
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
    return await this.prisma.member.findMany();
  }

  async getMembersByIds(memberIds: string[]) {
    return await this.prisma.member.findMany({
      where: { id: { in: memberIds } },
    });
  }

  async findMemberById(memberId: string) {
    return await this.prisma.member.findUnique({
      where: { id: memberId },
    });
  }

  async createMember(data: Prisma.MemberCreateInput) {
    const member = await this.prisma.member.create({ data });
    return member;
  }

  async getMember(id: string) {
    return await this.prisma.member.findUnique({
      where: { id },
      include: { chats: true },
    });
  }

  async updateMember(id: string, data: Prisma.MemberUpdateInput) {
    return await this.prisma.member.update({ where: { id }, data });
  }

  async deleteMember(id: string) {
    return await this.prisma.member.delete({ where: { id } });
  }
}
