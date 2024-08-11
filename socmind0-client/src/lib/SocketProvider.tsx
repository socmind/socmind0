// lib/SocketProvider.tsx
"use client";
import React, { useState, useEffect, useCallback, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { SocketContext, SocketContextType } from "./SocketContext";

export const SocketProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io("http://localhost:3001", {
      withCredentials: true,
    });

    newSocket.on("connect", () => setIsConnected(true));
    newSocket.on("disconnect", () => setIsConnected(false));

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const sendMessage = useCallback(
    (chatId: string, content: string) => {
      if (socket) {
        socket.emit("sendMessage", { chatId, content });
      }
    },
    [socket]
  );

  const joinChat = useCallback(
    (chatId: string) => {
      if (socket) {
        socket.emit("joinChat", chatId);
      }
    },
    [socket]
  );

  const getUserChats = useCallback(() => {
    if (socket) {
      socket.emit("getUserChats");
    }
  }, [socket]);

  const value: SocketContextType = {
    socket,
    isConnected,
    sendMessage,
    joinChat,
    getUserChats,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
