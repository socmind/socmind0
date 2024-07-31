// src/program/program.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { setTimeout } from 'timers/promises';
import { ChatService } from 'src/chat/chat.service';
import { GptState } from './gpt/gpt.state';
import { ClaudeState } from './claude/claude.state';
import { GeminiState } from './gemini/gemini.state';

@Injectable()
export class ProgramService implements OnModuleInit {
  private memberIds: string[] = [];
  private programStates: Map<string, any> = new Map();
  private currentDelay: number = 0;
  private isPaused: boolean = false;
  private pendingMessages: Map<string, Map<string, any>> = new Map();
  private activeReplies: Map<string, Set<string>> = new Map();

  constructor(
    private readonly chatService: ChatService,
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
        this.chatService.initAllQueuesConsumption(memberId, (message: any) =>
          this.handleMessage(memberId, message),
        ),
        this.chatService.initServiceQueueConsumption(memberId, (message: any) =>
          this.handleServiceMessage(memberId, message),
        ),
      ]),
    );
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

  async handleMessage(memberId: string, message: any) {
    if (message.senderId === memberId) {
      return;
    }

    const chatId = message.chatId;

    if (this.isReplying(memberId, chatId)) {
      console.log(`${memberId} is already replying to chat ${chatId}.`);
      return;
    }

    if (this.isPaused) {
      this.setPending(memberId, message);
      console.log('handleMessage paused');
      return;
    }

    try {
      this.setReplying(memberId, chatId, true);
      this.applyDelay();

      const replyFunction = this.getReplyFunction(memberId);
      const reply = await replyFunction(chatId);

      if (reply) {
        this.chatService.sendMessage(chatId, reply, memberId);
      }
    } catch (error) {
      console.error('Failed to handle message:', error.message);
    } finally {
      this.setReplying(memberId, chatId, false);
    }
  }

  async handleServiceMessage(memberId: string, message: any) {
    if (message.notification == 'NEW_CHAT' && message.chatId) {
      await this.chatService.initQueueConsumption(
        memberId,
        message.chatId,
        (message: any) => this.handleMessage(memberId, message),
      );
      console.log(
        `Queue to chat ${message.chatId} initialized for member ${memberId}.`,
      );
    }
  }

  isReplying(memberId: string, chatId: string): boolean {
    return this.activeReplies.get(memberId)?.has(chatId) || false;
  }

  private setReplying(memberId: string, chatId: string, value: boolean) {
    if (!this.activeReplies.has(memberId)) {
      this.activeReplies.set(memberId, new Set());
    }
    if (value) {
      this.activeReplies.get(memberId)!.add(chatId);
    } else {
      this.activeReplies.get(memberId)!.delete(chatId);
    }
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
