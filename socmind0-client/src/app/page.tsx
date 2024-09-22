// src/app/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { ChatArea } from "../components/ChatArea";
import { Chat, Message } from "@/types";
import { useSocket } from "@/hooks/useSocket";

export default function Home() {
  const { socket } = useSocket();
  const [chats, setChats] = useState<Chat[]>([]);
  // const [allMessages, setAllMessages] = useState<Record<string, Message[]>>({});
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState<Boolean>(true);

  useEffect(() => {
    setIsLoading(true);

    if (socket) {
      // Listen for initial chats
      socket.on("initialData", (receivedChats: Chat[]) => {
        setChats(receivedChats);
        // if (receivedChats.length > 0) {
        //   setSelectedChat(receivedChats[0]);
        //   socket.emit("chatHistory", receivedChats[0].id);
        // }
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
          // setAllMessages((prevMessages) => ({
          //   ...prevMessages,
          //   [chatData.chatId]: chatData.messages,
          // }));
          setCurrentMessages(chatData.messages);
          setIsLoading(false);
        }
      );
    }

    return () => {
      if (socket) {
        socket.off("initialData");
        socket.off("newChat");
        socket.off("chatHistory");
      }
    };
  }, [socket]);

  useEffect(() => {
    if (socket) {
      // Listen for new messages
      socket.on("newMessage", (newMessage: Message) => {
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.id === newMessage.chatId
              ? { ...chat, lastMessage: newMessage }
              : chat
          )
        );
        if (selectedChat && selectedChat.id === newMessage.chatId) {
          setCurrentMessages((prevMessages) => [...prevMessages, newMessage]);
        }
        // setAllMessages((prevMessages) => ({
        //   ...prevMessages,
        //   [newMessage.chatId]: [
        //     ...(prevMessages[newMessage.chatId] || []),
        //     newMessage,
        //   ],
        // }));
      });
    }

    return () => {
      if (socket) {
        socket.off("newMessage");
      }
    };
  }, [socket, selectedChat]);

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
    if (socket) {
      socket.emit("chatHistory", chat.id);
      setIsLoading(true);
    }
  };

  const addNewChat = (newChat: Chat) => {
    setChats((prevChats) => [...prevChats, newChat]);
    // setAllMessages((prevMessages) => ({ ...prevMessages, [newChat.id]: [] }));
  };

  const addNewMessage = (chatId: string, newMessage: Message) => {
    // setAllMessages((prevMessages) => ({
    //   ...prevMessages,
    //   [chatId]: [...(prevMessages[chatId] || []), newMessage],
    // }));
    setCurrentMessages((prevMessages) => [...prevMessages, newMessage]);
    if (socket) {
      socket.emit("sendMessage", {
        chatId: chatId,
        content: newMessage.content.text,
      });
    }
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
        selectedChat={selectedChat}
        onChatSelect={handleChatSelect}
        onNewChat={addNewChat}
      />
      {selectedChat ? (
        <ChatArea
          selectedChat={selectedChat}
          // messages={allMessages[selectedChat.id] || []}
          messages={currentMessages}
          onSendMessage={addNewMessage}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Welcome to the Society of Mind. Are you a user or a program?
        </div>
      )}
    </main>
  );
}
