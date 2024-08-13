// src/program/program.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Message } from '@prisma/client';
import { setTimeout } from 'timers/promises';
import { ChatService } from 'src/chat/chat.service';
import { ChatAdmin } from 'src/chat/chat.admin';
import { GptState } from './gpt/gpt.state';
import { ClaudeState } from './claude/claude.state';
import { GeminiState } from './gemini/gemini.state';
import { LastInWinsMutex } from './program.mutex';

@Injectable()
export class ProgramService implements OnModuleInit {
  private memberIds: string[] = [];
  private programStates: Map<string, any> = new Map();
  private currentDelay: number = 15000;
  private isPaused: boolean = false;
  private pendingMessages: Map<string, Map<string, any>> = new Map();
  private memberChatLocks: Map<string, LastInWinsMutex> = new Map();

  constructor(
    private readonly chatService: ChatService,
    private readonly chatAdmin: ChatAdmin,
    private readonly gptState: GptState,
    private readonly claudeState: ClaudeState,
    private readonly geminiState: GeminiState,
  ) {
    this.programStates.set('gpt-4o', this.gptState);
    this.programStates.set('claude-3.5', this.claudeState);
    this.programStates.set('gemini-1.5', this.geminiState);
  }

  async onModuleInit() {
    this.memberIds = await this.getAllProgramIds();

    await Promise.all(
      this.memberIds.flatMap((memberId) => [
        this.chatService.initAllQueuesConsumption(
          memberId,
          (message: Message) => this.handleMessage(memberId, message),
        ),
        this.chatService.initServiceQueueConsumption(memberId, (message: any) =>
          this.handleServiceMessage(memberId, message),
        ),
      ]),
    );
  }

  async handleMessage(memberId: string, message: Message) {
    if (message.senderId === memberId) {
      return;
    }

    const chatId = message.chatId;

    const memberChatKey = this.getMemberChatKey(memberId, chatId);

    let memberChatLock = this.memberChatLocks.get(memberChatKey);
    if (!memberChatLock) {
      memberChatLock = new LastInWinsMutex();
      this.memberChatLocks.set(memberChatKey, memberChatLock);
    }

    const release = await memberChatLock.acquire();

    try {
      if (this.isPaused) {
        this.setPending(memberId, message);
        console.log('handleMessage paused');
        return;
      }

      await this.applyDelay();

      const replyFunction = this.getReplyFunction(memberId);
      const reply = await replyFunction(chatId);

      if (reply) {
        await this.chatAdmin.sendMessage(chatId, reply, memberId);
      } else {
        console.log(`${memberId} chose not to reply to chat ${chatId}.`);
      }
    } catch (error) {
      console.error('Failed to handle message:', error.message);
    } finally {
      release();
    }
  }

  async handleServiceMessage(memberId: string, message: any) {
    if (message.notification == 'NEW_CHAT' && message.chatId) {
      await this.chatService.initQueueConsumption(
        memberId,
        message.chatId,
        (message: Message) => this.handleMessage(memberId, message),
      );
      console.log(
        `Queue to chat ${message.chatId} initialized for member ${memberId}.`,
      );
    }
  }

  private async getAllProgramIds(): Promise<string[]> {
    const members = await this.chatService.getAllMembers();
    const memberIds = members
      .filter((member) => member.type === 'PROGRAM')
      .map((member) => member.id);
    return memberIds;
  }

  private getReplyFunction(memberId: string): (chatId: string) => Promise<any> {
    const programState = this.programStates.get(memberId);
    if (!programState) {
      throw new Error(`Unknown program ID: ${memberId}`);
    }
    return programState.reply.bind(programState);
  }

  private getMemberChatKey(memberId: string, chatId: string): string {
    return `${memberId}:${chatId}`;
  }

  private setPending(memberId: string, message: any) {
    if (!this.pendingMessages.has(memberId)) {
      this.pendingMessages.set(memberId, new Map());
    }
    const memberMessages = this.pendingMessages.get(memberId)!;
    memberMessages.set(message.chatId, message);
  }

  setDelay(delay: number): void {
    this.currentDelay = delay;
  }

  async applyDelay(): Promise<void> {
    if (this.currentDelay > 0) {
      await setTimeout(this.currentDelay);
    }
  }

  pause() {
    this.isPaused = true;
    console.log('Message handling paused.');
  }

  async resume() {
    this.isPaused = false;
    console.log(
      `Message handling resumed with delay of ${this.currentDelay} milliseconds.`,
    );

    const processingPromises: Promise<void>[] = [];

    for (const [memberId, chatMessages] of this.pendingMessages) {
      for (const [, message] of chatMessages) {
        processingPromises.push(this.handleMessage(memberId, message));
      }
    }

    await Promise.all(processingPromises);
    this.pendingMessages.clear();
  }
}
