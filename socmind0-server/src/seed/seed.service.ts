// src/seed/seed.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'src/chat/infrastructure/database/prisma.service';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedData();
  }

  async seedData() {
    // Seeding Members
    const flynn = await this.prisma.member.create({
      data: {
        id: 'flynn',
        name: 'Flynn',
        username: 'flynn',
        email: 'flynn@encom.com',
        type: 'USER',
      },
    });

    const gpt4o = await this.prisma.member.create({
      data: {
        id: 'gpt-4o',
        name: 'Charles',
        username: 'gpt-4o',
        systemMessage: 'Your name is Charles.',
        type: 'PROGRAM',
      },
    });

    // Seeding Chats
    const chat1 = await this.prisma.chat.create({
      data: {
        name: 'First Chat',
        context: 'Please introduce yourselves.',
      },
    });

    // Seeding ChatMembers and Messages
    await this.prisma.chatMember.create({
      data: {
        memberId: flynn.id,
        chatId: chat1.id,
      },
    });

    await this.prisma.chatMember.create({
      data: {
        memberId: gpt4o.id,
        chatId: chat1.id,
      },
    });

    await this.prisma.message.create({
      data: {
        content: { text: 'Hi everyone, please introduce yourselves.' },
        chatId: chat1.id,
        type: 'SYSTEM',
      },
    });

    console.log('Seeding finished.');
  }
}