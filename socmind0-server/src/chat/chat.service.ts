// src/chat/chat.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { MessageType, Prisma } from '@prisma/client';
import { PrismaService } from './infrastructure/database/prisma.service';
import { RabbitMQService } from './infrastructure/message-broker/rabbitmq.service';
import { ChatPrompts } from './chat.prompts';

@Injectable()
export class ChatService implements OnModuleInit {
  private chatDirectory: Map<string, string[]> = new Map();

  constructor(
    private prismaService: PrismaService,
    private rabbitMQService: RabbitMQService,
    private chatPrompts: ChatPrompts,
  ) {}

  async onModuleInit() {
    await this.createServiceQueues();
    await this.initiateDirectory();
  }

  // Main methods
  async publishMessage(chatId: string, content: any, senderId?: string) {
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

  async createChat(
    memberIds: string[],
    name?: string,
    topic?: string,
    creator?: string,
    context?: string,
  ) {
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

    if (creator) {
      chatData.creator = creator;
    }

    const chat = await this.prismaService.createChat(chatData);

    await this.rabbitMQService.createOrAddMembersToGroupChat(
      chat.id,
      memberIds,
    );

    await this.setFirstMessage(memberIds, chat.id, topic);

    for (const memberId of memberIds) {
      await this.rabbitMQService.sendServiceMessage(memberId, {
        notification: 'NEW_CHAT',
        chatId: chat.id,
      });
    }

    if (context) {
      await this.setChatContext(chat.id, context);
    }

    this.updateDirectory(chat.id, memberIds);

    console.log(`Chat ${chat.id} created with members: ${memberIds}.`);

    return chat;
  }

  async setFirstMessage(memberIds: string[], chatId: string, topic?: string) {
    const members = await this.prismaService.member.findMany({
      where: {
        id: {
          in: memberIds,
        },
      },
    });

    const memberInfo = members
      .map((member) => `${member.name}: ${member.description}`)
      .join('\n');

    const directory = `Committee created with the following members:\n${memberInfo}\n`;

    const guidelines = this.chatPrompts.getTaskDelegationPrompt();

    if (topic) {
      const topicMessage = `Here is the topic for the present discussion: ${topic}.\n`;
      const conclusionPrompt = this.chatPrompts.getConclusionPrompt();
      const firstMessage =
        directory + topicMessage + conclusionPrompt + guidelines;

      await this.publishMessage(chatId, { text: firstMessage });

      console.log(`First message sent for chat ${chatId}: ${firstMessage}.`);
      return firstMessage;
    } else {
      const firstMessage = directory + guidelines;
      const messageData: Prisma.MessageCreateInput = {
        chat: { connect: { id: chatId } },
        content: { text: firstMessage },
        type: 'SYSTEM',
      };

      await this.prismaService.createMessage(messageData);

      console.log(
        `First message added to database for chat ${chatId}: ${firstMessage}.`,
      );
      return firstMessage;
    }
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

    await this.publishMessage(chatId, {
      text: `${memberId} has joined the chat.`,
    });

    this.updateDirectory(chatId, [memberId]);

    return chatMember;
  }

  async setChatContext(chatId: string, context: string) {
    try {
      const updatedChat = await this.prismaService.updateChat(chatId, {
        context: context,
      });
      await this.publishMessage(chatId, context);
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
      await this.publishMessage(chatId, msg);

      const chat = await this.prismaService.getChat(chatId);
      if (chat.creator) {
        const report = `Message from group '${chat.name}':\n
        A conclusion has been reached regarding the task '${chat.topic}'.
        Here is the conclusion: '${conclusion}'.`;
        await this.publishMessage(chat.creator, { text: report });
      }

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

  // In-memory methods
  async initiateDirectory() {
    const allChats = await this.prismaService.getAllChats();
    allChats.forEach((chat) => {
      const chatId = chat.id;
      const memberIds = chat.members.map((member) => member.memberId);
      this.chatDirectory.set(chatId, memberIds);
    });
  }

  getChatDirectory() {
    return this.chatDirectory;
  }

  updateDirectory(chatId: string, memberIds: string[]): void {
    if (this.chatDirectory.has(chatId)) {
      const existingMemberIds = this.chatDirectory.get(chatId)!;
      const updatedMemberIds = Array.from(
        new Set([...existingMemberIds, ...memberIds]),
      );
      this.chatDirectory.set(chatId, updatedMemberIds);
    } else {
      this.chatDirectory.set(chatId, [...new Set(memberIds)]);
    }
  }
}
