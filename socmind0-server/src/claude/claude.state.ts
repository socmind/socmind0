// claude.state.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class ClaudeState {
  private systemPrompt: string = `Your name is Claudia. You are in a multi-speaker conversation.
  Prepend "Claudia: " to all of your replies, so that conversants know who is speaking.
  You don't need to reply to every message.
  If you deem that nothing needs to be said, reply with just the empty string, without "Claudia: " prepended.`;

  private memory: any[] = [];

  private transformMessage(msg: any): any {
    if (msg.content) {
      return { role: 'user', content: msg.content };
    } else {
      throw new Error('Claude error: content field missing from message.');
    }
  }

  transformAndAddMessage(rawMessage: any) {
    const message = this.transformMessage(rawMessage);
    const lastMessage =
      this.memory.length > 0 ? this.memory[this.memory.length - 1] : null;
    if (lastMessage && lastMessage.role === message.role) {
      lastMessage.content += `\n${message.content}`;
    } else {
      this.memory.push(message);
    }
  }

  addMessage(msg: any) {
    const message = { role: msg.role, content: msg.content };
    const lastMessage =
      this.memory.length > 0 ? this.memory[this.memory.length - 1] : null;
    if (lastMessage && lastMessage.role === message.role) {
      lastMessage.content += `\n${message.content}`;
    } else {
      this.memory.push(message);
    }
  }

  getFormattedMessages(): any[] {
    return this.memory;
  }

  getSystemPrompt(): string {
    return this.systemPrompt;
  }
}
