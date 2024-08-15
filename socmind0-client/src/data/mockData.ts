// src/data/mockData.ts
import { Chat, Message } from "@/types";

export const mockChats: Chat[] = [
  {
    id: "1",
    memberIds: ["해린", "Charlie", "Dana"],
    name: null,
    context: null,
    creator: "해린",
    topic: "New Project Discussion",
    conclusion: null,
    createdAt: new Date("2023-08-14T08:00:00"),
    updatedAt: new Date("2023-08-14T10:40:00"),
  },
  {
    id: "2",
    memberIds: ["Mom", "Dad", "Sis"],
    name: "Family",
    context: null,
    creator: "Mom",
    topic: null,
    conclusion: null,
    createdAt: new Date("2023-08-14T14:30:00"),
    updatedAt: new Date("2023-08-14T15:20:00"),
  },
];

export const mockMessages: Record<string, Message[]> = {
  "1": [
    {
      id: "1",
      content: {
        text: "こんにちは！新しいプロジェクトについて話し合いましょう。",
      },
      senderId: "해린",
      chatId: "1",
      createdAt: new Date("2023-08-14T09:00:00"),
      type: "MEMBER",
    },
    {
      id: "2",
      content: { text: "Sounds good. What's our first step?" },
      senderId: "Charlie",
      chatId: "1",
      createdAt: new Date("2023-08-14T09:05:00"),
      type: "MEMBER",
    },
    {
      id: "3",
      content: { text: "I think we should start with market research." },
      senderId: "Dana",
      chatId: "1",
      createdAt: new Date("2023-08-14T09:10:00"),
      type: "MEMBER",
    },
    {
      id: "4",
      content: { text: "Agreed. I'll prepare an initial report by next week." },
      senderId: "Me",
      chatId: "1",
      createdAt: new Date("2023-08-14T09:15:00"),
      type: "MEMBER",
    },
    {
      id: "5",
      content: { text: "New project documents uploaded" },
      senderId: null,
      chatId: "1",
      createdAt: new Date("2023-08-14T10:00:00"),
      type: "SYSTEM",
    },
    {
      id: "6",
      content: { text: "Great! I can help with the competitive analysis." },
      senderId: "Charlie",
      chatId: "1",
      createdAt: new Date("2023-08-14T10:05:00"),
      type: "MEMBER",
    },
    {
      id: "7",
      content: { text: "素晴らしいです！私は顧客調査を担当します。" },
      senderId: "해린",
      chatId: "1",
      createdAt: new Date("2023-08-14T10:10:00"),
      type: "MEMBER",
    },
    {
      id: "8",
      content: {
        text: "I'll work on the SWOT analysis. When should we reconvene?",
      },
      senderId: "Dana",
      chatId: "1",
      createdAt: new Date("2023-08-14T10:15:00"),
      type: "MEMBER",
    },
    {
      id: "9",
      content: {
        text: `How about next Friday? That gives us a week to gather initial data. Sic semper tyrannis, gentlemen.
        Then out spake brave Horatius, the captain of the gate. To all men upon this earth, death cometh soon or late.
        And how can man die better, than facing fearful odds, for the ashes of his fathers and the temples of his gods.`,
      },
      senderId: "Me",
      chatId: "1",
      createdAt: new Date("2023-08-14T10:20:00"),
      type: "MEMBER",
    },
    {
      id: "10",
      content: { text: "Friday works for me. Same time?" },
      senderId: "Charlie",
      chatId: "1",
      createdAt: new Date("2023-08-14T10:25:00"),
      type: "MEMBER",
    },
    {
      id: "11",
      content: { text: "はい、金曜日の同じ時間で大丈夫です。" },
      senderId: "해린",
      chatId: "1",
      createdAt: new Date("2023-08-14T10:30:00"),
      type: "MEMBER",
    },
    {
      id: "12",
      content: {
        text: `Sounds like a plan. Let's touch base mid-week if anyone needs help. Sic transit gloria mundi.
        By the old Moulmein pagoda, looking lazy at the sea. Oh the road to Mandalay, where the flying fishes play,
        And the dawn comes up like thunder, out of China 'cross the bay.`,
      },
      senderId: "Dana",
      chatId: "1",
      createdAt: new Date("2023-08-14T10:35:00"),
      type: "MEMBER",
    },
    {
      id: "13",
      content: {
        text: "Mid-week meeting scheduled. Esse quam videri.",
      },
      senderId: null,
      chatId: "1",
      createdAt: new Date("2023-08-14T10:40:00"),
      type: "SYSTEM",
    },
  ],
  "2": [
    {
      id: "1",
      content: { text: "Dinner at our place tonight?" },
      senderId: "Mom",
      chatId: "2",
      createdAt: new Date("2023-08-14T15:00:00"),
      type: "MEMBER",
    },
    {
      id: "2",
      content: { text: "I'll be home by 6:30." },
      senderId: "Dad",
      chatId: "2",
      createdAt: new Date("2023-08-14T15:05:00"),
      type: "MEMBER",
    },
    {
      id: "3",
      content: { text: "Can I bring a friend?" },
      senderId: "Sis",
      chatId: "2",
      createdAt: new Date("2023-08-14T15:10:00"),
      type: "MEMBER",
    },
    {
      id: "4",
      content: { text: "Sounds great! Sis, of course you can bring a friend." },
      senderId: "Me",
      chatId: "2",
      createdAt: new Date("2023-08-14T15:15:00"),
      type: "MEMBER",
    },
    {
      id: "5",
      content: { text: "Perfect! I'll make extra." },
      senderId: "Mom",
      chatId: "2",
      createdAt: new Date("2023-08-14T15:20:00"),
      type: "MEMBER",
    },
  ],
};
