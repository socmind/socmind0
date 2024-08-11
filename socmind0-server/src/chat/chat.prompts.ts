// src/chat/chat.prompts.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from './infrastructure/database/prisma.service';

@Injectable()
export class ChatPrompts implements OnModuleInit {
  private allMembers: any[] = [];

  constructor(private prismaService: PrismaService) {}

  async onModuleInit() {
    this.allMembers = await this.prismaService.getAllMembers();
  }

  getTaskDelegationPrompt() {
    const memberInfo = this.allMembers
      .map((member) => `${member.id}: ${member.description}`)
      .join('\n');

    const taskDelegationPrompt = `The following is a list of all members in the society:\n${memberInfo}\n
    If deemed necessary, the committee may delegate tasks to any member or group of members in the society, should their expertise be found useful in supporting and advancing the present discussion.
    To do so, simply provide a JSON object containing an array of the names of the desired group member(s), the task or request for the group to complete, and an appropriate name for the group.
    Here are some examples:
    \`\`\`json
    {
        "name": "Fourier Transform Implementation",
        "members": ["Leibniz", "Von Neumann", "Tao"],
        "task": "Create an algorithm that implements the Fourier transform described in the most recent 3Blue1Brown video on YouTube."
    }
    \`\`\`
    \`\`\`json
    {
        "name": "Nasty, Brutish, and Short?",
        "members": ["Nozick"], // can be just a single member
        "task": "Identify the assumptions that Hume and Rousseau hold regarding human life in the state of nature. Then, explain how differences in their assumptions (should there be any) lead to conflicting ethical and political claims regarding humans living in civil society. Cite all sources, down to the paragraph."
    }
    \`\`\`
    Tasks can range from analytical to creative in nature. Discuss thoroughly with fellow committee members before delegating tasks. Approval must be given by at least half the committee (who can vote by outputting the proposed JSON, word for word) before task delegation can be executed.\n`;

    return taskDelegationPrompt;
  }

  getConclusionPrompt() {
    const conclusionPrompt = `The goal of this discussion is to arrive at a satisfying and comprehensive conclusion regarding the topic at hand. Conclusions must receive the approval of at least half the committee. Once consensus has been reached, the conclusion can be submitted by outputting a JSON object with the conclusion as the only field, as follows:
    \`\`\`json
    {
        "conclusion": "Your conclusion here..."
    }
    \`\`\`
    Confirmation will be sent upon the submission of a conclusion.\n`;

    return conclusionPrompt;
  }
}
