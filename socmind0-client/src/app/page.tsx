// src/app/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { ChatArea } from "../components/ChatArea";
import { Chat, Message } from "@/types";
import { io, Socket } from "socket.io-client";

const socket: Socket = io("http://localhost:3001", {
  withCredentials: true,
});

export default function Home() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    // Connect to the socket
    socket.connect();
    console.log("Socket connected: ", socket.id);

    // Listen for initial chats
    socket.on("chats", (receivedChats: Chat[]) => {
      setChats(receivedChats);
      if (receivedChats.length > 0) {
        setSelectedChat(receivedChats[0]);
        socket.emit("chatHistory", receivedChats[0].id);
      }
      setIsLoading(false);
    });

    // Listen for new chats
    socket.on("newChat", (newChat: Chat) => {
      setChats((prevChats) => [...prevChats, newChat]);
    });

    // Listen for chat history
    socket.on(
      "chatHistory",
      (chatData: { chatId: string; messages: Message[] }) => {
        setMessages((prevMessages) => ({
          ...prevMessages,
          [chatData.chatId]: chatData.messages,
        }));
      }
    );

    // Listen for new messages
    socket.on("newMessage", (newMessage: Message) => {
      setMessages((prevMessages) => ({
        ...prevMessages,
        [newMessage.chatId]: [
          ...(prevMessages[newMessage.chatId] || []),
          newMessage,
        ],
      }));
    });

    // Cleanup on component unmount
    return () => {
      console.log("Socket disconnecting: ", socket.id);
      socket.disconnect();
    };
  }, []);

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
  };

  const addNewChat = (newChat: Chat) => {
    setChats((prevChats) => [...prevChats, newChat]);
    setMessages((prevMessages) => ({ ...prevMessages, [newChat.id]: [] }));
  };

  const addNewMessage = (chatId: string, newMessage: Message) => {
    setMessages((prevMessages) => ({
      ...prevMessages,
      [chatId]: [...(prevMessages[chatId] || []), newMessage],
    }));
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-2xl font-semibold text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <main className="flex h-screen bg-gray-100">
      <Sidebar
        chats={chats}
        messages={messages}
        selectedChat={selectedChat}
        onChatSelect={handleChatSelect}
        onNewChat={addNewChat}
      />
      {selectedChat ? (
        <ChatArea
          selectedChat={selectedChat}
          messages={messages[selectedChat.id] || []}
          onSendMessage={addNewMessage}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Welcome to the Society of Mind. Select a chat or start a new
          conversation.
        </div>
      )}
    </main>
  );
}
