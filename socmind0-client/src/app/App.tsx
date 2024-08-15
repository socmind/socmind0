import { ChatArea } from "@/components/ChatArea";
import { Sidebar } from "@/components/Sidebar";
import { mockChats, mockMessages } from "@/data/mockData";
import { Chat, Message } from "@/types";
import React, { useState, useEffect } from "react";

function App(): JSX.Element {
  const [selectedChat, setSelectedChat] = useState<Chat>(mockChats[0]);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    setMessages(mockMessages[selectedChat.id] || []);
  }, [selectedChat]);

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        chats={mockChats}
        selectedChat={selectedChat}
        onChatSelect={handleChatSelect}
      />
      <ChatArea selectedChat={selectedChat} messages={messages} />
    </div>
  );
}

export default App;
