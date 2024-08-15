// src/app/page.tsx
"use client";

import React, { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { ChatArea } from "../components/ChatArea";
import { Chat } from "../types";
import { mockChats, mockMessages } from "@/data/mockData";

export default function Home() {
  const [selectedChat, setSelectedChat] = useState<Chat>(mockChats[0]);

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
  };

  return (
    <main className="flex h-screen bg-gray-100">
      <Sidebar
        chats={mockChats}
        selectedChat={selectedChat}
        onChatSelect={handleChatSelect}
      />
      <ChatArea
        selectedChat={selectedChat}
        messages={mockMessages[selectedChat.id] || []}
      />
    </main>
  );
}
