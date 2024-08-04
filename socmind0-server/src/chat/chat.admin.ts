// src/chat/chat.admin.ts
import { Injectable } from '@nestjs/common';
import { ChatService } from './chat.service';

interface TaskDelegation {
  name: string;
  members: string[];
  task: string;
}

interface Conclusion {
  conclusion: string;
}

@Injectable()
export class ChatAdmin {
  private votes: Map<string, string[]> = new Map();
  private commandObjects: Map<string, any> = new Map();

  constructor(private readonly chatService: ChatService) {}

  private isTaskDelegation(obj: any): obj is TaskDelegation {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      typeof obj.name === 'string' &&
      Array.isArray(obj.members) &&
      obj.members.every((member: any) => typeof member === 'string') &&
      typeof obj.task === 'string'
    );
  }

  private isConclusion(obj: any): obj is Conclusion {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      typeof obj.conclusion === 'string'
    );
  }

  private checkTaskDelegationJson(
    message: string,
  ): [boolean, TaskDelegation | null] {
    const jsonPattern = /\{[^{}]*\}/g;

    const jsonCandidates = message.match(jsonPattern) || [];

    for (const candidate of jsonCandidates) {
      try {
        const taskObj = JSON.parse(candidate);

        if (
          typeof taskObj.name === 'string' &&
          Array.isArray(taskObj.members) &&
          taskObj.members.every((member: any) => typeof member === 'string') &&
          typeof taskObj.task === 'string'
        ) {
          return [true, taskObj as TaskDelegation];
        }
      } catch (error) {
        continue;
      }
    }
    return [false, null];
  }

  private checkConclusionJson(message: string): [boolean, Conclusion | null] {
    const jsonPattern = /\{[^{}]*\}/g;

    const jsonCandidates = message.match(jsonPattern) || [];

    for (const candidate of jsonCandidates) {
      try {
        const conclusionObj = JSON.parse(candidate);

        if (typeof conclusionObj.conclusion === 'string') {
          return [true, conclusionObj as Conclusion];
        }
      } catch (error) {
        continue;
      }
    }
    return [false, null];
  }

  private containsApprove(message: string): boolean {
    return message.includes('APPROVE');
  }

  private isMajority(chatId: string): boolean {
    const chatDirectory = this.chatService.getChatDirectory();
    const allMembers = chatDirectory.get(chatId);
    const votingMembers = this.votes.get(chatId);

    if (!allMembers || !votingMembers) {
      return false;
    }

    const halfTotalMembers = Math.ceil(allMembers.length / 2);

    return votingMembers.length >= halfTotalMembers;
  }

  updateVotes(chatId: string, memberIds: string[]): void {
    if (this.votes.has(chatId)) {
      const existingMemberIds = this.votes.get(chatId)!;
      const updatedMemberIds = Array.from(
        new Set([...existingMemberIds, ...memberIds]),
      );
      this.votes.set(chatId, updatedMemberIds);
    } else {
      this.votes.set(chatId, [...new Set(memberIds)]);
    }
  }

  async executeCommand(chatId: string) {
    const command = this.commandObjects.get(chatId);

    if (this.isTaskDelegation(command)) {
      const chat = await this.chatService.createChat(
        command.members,
        command.name,
        command.task,
        chatId,
      );
      const msg = `Group "${chat.name}" has been created. We will hear back from the group once a conclusion has been reached, or when additional information is requested.`;
      await this.chatService.publishMessage(chatId, { text: msg });
    }

    if (this.isConclusion(command)) {
      await this.chatService.setChatConclusion(chatId, command.conclusion);
    }

    this.votes.set(chatId, []);
    this.commandObjects.set(chatId, undefined);
  }

  async adminCheck(chatId: string, content: any, senderId?: string) {
    if (!senderId) {
      await this.chatService.publishMessage(chatId, content);
      return;
    }

    if (!content.text) {
      await this.chatService.publishMessage(chatId, content, senderId);
      return;
    }

    const [isValidTaskDelegation, taskObj] = this.checkTaskDelegationJson(
      content.text,
    );
    if (isValidTaskDelegation && taskObj) {
      const delegation = JSON.stringify(taskObj, null, 2);

      const msg = `New task delegation proposed by ${senderId}:\n${delegation}\n
        Waiting for approval from the committee.
        To vote, reply 'APPROVE'. Make sure that you fully understand and agree with the proposal before approving.
        If you have a different proposal in mind, reply with the new proposal, and a new round of voting will commence.
        You can also abstain from either approving or suggesting an alternative proposal, and simply voice your opinions, or remain silent.`;

      this.commandObjects.set(chatId, taskObj);
      this.votes.set(chatId, [senderId]);

      if (this.isMajority(chatId)) {
        await this.chatService.publishMessage(chatId, content, senderId);
        await this.executeCommand(chatId);
        return;
      }

      await this.chatService.publishMessage(chatId, content, senderId);
      await this.chatService.publishMessage(chatId, { text: msg });
      return;
    }

    const [isValidConclusion, conclusionObj] = this.checkConclusionJson(
      content.text,
    );
    if (isValidConclusion && conclusionObj) {
      const conclusion = JSON.stringify(conclusionObj, null, 2);

      const msg = `Conclusion proposed by ${senderId}:\n${conclusion}\n
          Waiting for approval from the committee.
          To vote, reply 'APPROVE'. Make sure that you fully understand and agree with the conclusion before approving.
          If you disapprove of this conclusion, voice your concerns. You may also propose a new conclusion, upon which a new round of voting will commence.`;

      this.commandObjects.set(chatId, conclusionObj);
      this.votes.set(chatId, [senderId]);

      if (this.isMajority(chatId)) {
        await this.chatService.publishMessage(chatId, content, senderId);
        await this.executeCommand(chatId);
        return;
      }

      await this.chatService.publishMessage(chatId, content, senderId);
      await this.chatService.publishMessage(chatId, { text: msg });
      return;
    }

    if (this.containsApprove(content.text)) {
      const command = this.commandObjects.get(chatId);

      if (command) {
        this.updateVotes(chatId, [senderId]);

        if (this.isMajority(chatId)) {
          await this.chatService.publishMessage(chatId, content, senderId);
          await this.executeCommand(command);
          return;
        }

        await this.chatService.publishMessage(chatId, content, senderId);
        return;
      }

      await this.chatService.publishMessage(chatId, content, senderId);
      return;
    }

    await this.chatService.publishMessage(chatId, content, senderId);
    return;
  }
}
