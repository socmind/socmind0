// src/types/index.ts
export interface Chat {
  memberIds: string[];
  id: string;
  name: string | null;
  context: string | null;
  creator: string | null;
  topic: string | null;
  conclusion: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  content: {
    text: string;
  };
  senderId: string | null;
  chatId: string;
  createdAt: Date;
  type: "MEMBER" | "SYSTEM";
}
