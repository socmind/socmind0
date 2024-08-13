// hooks/useChatData.ts
"use client";
import { useState, useEffect } from "react";
import { useSocket } from "./useSocket";

interface Chat {
  id: string;
  name: string | null;
  context: string | null;
  creator: string | null;
  topic: string | null;
  conclusion: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export const useChatData = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const { socket, getUserChats } = useSocket();

  useEffect(() => {
    console.log("useChatData effect running");
    if (socket) {
      console.log("Socket connected, getting user chats");
      getUserChats();

      socket.on("userChats", (userChats: Chat[]) => {
        console.log("Received userChats:", userChats);
        setChats(userChats);
      });

      socket.on("newChat", ({ chatId }) => {
        console.log("New chat created:", chatId);
        getUserChats();
      });

      return () => {
        socket.off("userChats");
        socket.off("newChat");
      };
    }
  }, [socket, getUserChats]);

  return chats;
};
