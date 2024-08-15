import React, { useState, useEffect, useRef } from "react";
import { Search, Send } from "lucide-react";

interface Chat {
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

interface Message {
  id: string;
  content: {
    text: string;
  };
  senderId: string | null;
  chatId: string;
  createdAt: Date;
  type: "MEMBER" | "SYSTEM";
}

const chats: Chat[] = [
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

const allMessages: Record<string, Message[]> = {
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
        text: "How about next Friday? That gives us a week to gather initial data. Sic semper tyrannis, gentlemen.",
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
        text: "Sounds like a plan. Let's touch base mid-week if anyone needs help. Sic transit gloria mundi.",
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

function getRecentMessage(chatId: string): string {
  const messages = allMessages[chatId];
  return messages && messages.length > 0
    ? messages[messages.length - 1].content.text
    : "";
}

interface MessageBubbleProps {
  message: Message;
  isUser: boolean;
}

function MessageBubble({ message, isUser }: MessageBubbleProps): JSX.Element {
  const bubbleClass = isUser
    ? "bg-blue-500 text-white ml-auto"
    : "bg-gray-200 text-black";

  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      } mb-4 items-end`}
    >
      {!isUser && message.senderId && (
        <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 mr-2 flex items-center justify-center text-xs font-semibold">
          {message.senderId.slice(0, 2).toUpperCase()}
        </div>
      )}
      <div className="max-w-[70%] flex flex-col">
        {!isUser && message.senderId && (
          <span className="text-xs text-gray-500 mb-1">{message.senderId}</span>
        )}
        <div
          className={`py-2 px-3 rounded-2xl ${bubbleClass} flex items-center h-8`}
        >
          <span className="truncate">{message.content.text}</span>
        </div>
      </div>
    </div>
  );
}

interface SystemMessageProps {
  message: Message;
}

function SystemMessage({ message }: SystemMessageProps): JSX.Element {
  return (
    <div className="flex justify-center my-2">
      <span className="text-xs text-gray-500">{message.content.text}</span>
    </div>
  );
}

function MessageApp(): JSX.Element {
  const [selectedChat, setSelectedChat] = useState<Chat>(chats[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    setMessages(allMessages[selectedChat.id] || []);
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
  };

  const getChatDisplayName = (chat: Chat): string => {
    return chat.name || `Chat with ${chat.memberIds.join(", ")}`;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left sidebar */}
      <div className="w-1/4 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-4 py-2 border rounded-md"
            />
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={20}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`flex items-center p-4 h-20 cursor-pointer ${
                selectedChat.id === chat.id ? "bg-blue-100" : ""
              }`}
              onClick={() => handleChatSelect(chat)}
            >
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-lg font-semibold">
                  {getChatDisplayName(chat)[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">
                  {getChatDisplayName(chat)}
                </h3>
                <p className="text-sm text-gray-500 truncate">
                  {getRecentMessage(chat.id)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white p-4 shadow">
          <h2 className="font-semibold">
            To: {getChatDisplayName(selectedChat)}
          </h2>
          <p className="text-sm text-gray-500">
            {selectedChat.memberIds.join(", ")}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((message) =>
            message.type === "SYSTEM" ? (
              <SystemMessage key={message.id} message={message} />
            ) : (
              <MessageBubble
                key={message.id}
                message={message}
                isUser={message.senderId === "Me"}
              />
            )
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="bg-white p-4 border-t">
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 border rounded-full py-2 px-4 mr-2"
            />
            <button className="bg-blue-500 text-white rounded-full p-2">
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MessageApp;
