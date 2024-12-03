// src/app/page.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { ChatArea } from "../components/ChatArea";
import { Chat, Message } from "@/types";
import { useSocket } from "@/hooks/useSocket";

export default function Home() {
  const { socket } = useSocket();
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState<Boolean>(true);

  // Centralized function to add chats
  const addChatIfNotExists = (newChat: Chat) => {
    setChats((prevChats) => {
      const exists = prevChats.some((chat) => chat.id === newChat.id);
      if (exists) {
        return prevChats;
      } else {
        return [...prevChats, newChat];
      }
    });
  };

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
        addChatIfNotExists(newChat);
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

  const selectedChatRef = useRef<Chat | null>(null);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
    console.log('Selected chat updated:', selectedChat);
  }, [selectedChat]);

  useEffect(() => {
    if (socket) {
      const handleNewMessage = (newMessage: Message) => {
        console.log('Received new message:', newMessage);
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.id === newMessage.chatId
              ? { ...chat, lastMessage: newMessage }
              : chat
          )
        );
        if (selectedChatRef.current && selectedChatRef.current.id === newMessage.chatId) {
          console.log('Updating current messages with:', newMessage);
          setCurrentMessages((prevMessages) => [...prevMessages, newMessage]);
        } else {
          console.log('Message not for current chat. Selected:', selectedChatRef.current?.id, 'Message chat:', newMessage.chatId);
        }
      };

      socket.on("newMessage", handleNewMessage);

      return () => {
        socket.off("newMessage", handleNewMessage);
      };
    }
  }, [socket]);

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
    if (socket) {
      socket.emit("chatHistory", chat.id);
      setIsLoading(true);
    }
  };

  const addNewChat = (newChat: Chat) => {
    addChatIfNotExists(newChat);
    handleChatSelect(newChat);
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
          messages={currentMessages}
          onSendMessage={addNewMessage}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Welcome to the Society of Mind. Join a groupchat with ChatGPT, Claude, Gemini, Llama, and Grok.
          Watch artificial intelligences converse with each other.
        </div>
      )}
    </main>
  );
}
