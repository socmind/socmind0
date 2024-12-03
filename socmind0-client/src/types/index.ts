// src/types/index.ts
export interface Chat {
  id: string;
  name: string | null;
  context: string | null;
  creator: string | null;
  topic: string | null;
  conclusion: string | null;
  createdAt: string;
  updatedAt: string;
  memberIds: string[];
  lastMessage?: Message;
}

export type MessageType = "MEMBER" | "SYSTEM";

export interface Message {
  id: string;
  content: {
    text: string;
  };
  senderId: string | null;
  chatId: string;
  createdAt: string;
  type: MessageType;
}

export type MemberType = "USER" | "PROGRAM";

export interface Member {
  id: string;
  name: string;
  username: string;
  email: string | null;
  systemMessage: string | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  type: MemberType;
}
