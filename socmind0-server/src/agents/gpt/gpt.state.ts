// gpt.state.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class GptState {
  private memory: any[] = [
    {
      role: 'system',
      content: `Your name is Charles.
      You are in a multi-speaker conversation.
      Prepend "Charles: " to all of your replies, so that conversants know who is speaking.
      You don't need to reply to every message.
      If you deem that nothing needs to be said, reply with just the empty string, without "Charles: " prepended.`,
    },
  ];

  private transformMessage(msg: any): any {
    if (msg.content) {
      return { role: 'user', content: msg.content };
    } else {
      throw new Error('GPT-4 error: content field missing from message.');
    }
  }

  transformAndAddMessage(rawMessage: any) {
    const message = this.transformMessage(rawMessage);
    this.memory.push(message);
  }

  addMessage(message: any) {
    this.memory.push(message);
  }

  getFormattedMessages(): any[] {
    return this.memory;
  }
}
