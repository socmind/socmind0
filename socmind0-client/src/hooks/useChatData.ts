// hooks/useChatData.ts
"use client";
import { useState, useEffect } from "react";
import { useSocket } from "./useSocket";

interface Chat {
  id: string;
  name: string;
  members: string[];
}

export const useChatData = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const { socket, getUserChats } = useSocket();

  useEffect(() => {
    if (socket) {
      getUserChats();

      socket.on("userChats", (userChats: Chat[]) => {
        setChats(userChats);
      });

      socket.on("newChat", ({ chatId }) => {
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
