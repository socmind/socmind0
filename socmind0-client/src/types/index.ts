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

export interface Message {
  id: string;
  content: {
    text: string;
  };
  senderId: string | null;
  chatId: string;
  createdAt: string;
  type: "MEMBER" | "SYSTEM";
}
