// lib/SocketProvider.tsx
"use client";
import React, { useState, useEffect, useCallback, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { SocketContext, SocketContextType } from "./SocketContext";

const SOCKET_SERVER_URL = "http://localhost:3001";

export const SocketProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  console.log("SocketProvider is rendering");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    console.log("SocketProvider useEffect is running");
    const newSocket = io(SOCKET_SERVER_URL, {
      withCredentials: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const onConnect = () => {
      console.log("Socket connected");
      setIsConnected(true);
    };

    const onDisconnect = (reason: string) => {
      console.log(`Socket disconnected: ${reason}`);
      setIsConnected(false);
    };

    const onConnectError = (error: Error) => {
      console.error("Connection error:", error);
      setIsConnected(false);
    };

    newSocket.on("connect", onConnect);
    newSocket.on("disconnect", onDisconnect);
    newSocket.on("connect_error", onConnectError);

    setSocket(newSocket);

    return () => {
      newSocket.off("connect", onConnect);
      newSocket.off("disconnect", onDisconnect);
      newSocket.off("connect_error", onConnectError);
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, []);

  const sendMessage = useCallback(
    (chatId: string, content: string) => {
      if (socket && isConnected) {
        console.log(`Sending message to chat ${chatId}`);
        socket.emit("sendMessage", { chatId, content });
      } else {
        console.warn("Cannot send message: Socket not connected");
      }
    },
    [socket, isConnected]
  );

  const joinChat = useCallback(
    (chatId: string) => {
      if (socket && isConnected) {
        console.log(`Joining chat ${chatId}`);
        socket.emit("joinChat", chatId);
      } else {
        console.warn("Cannot join chat: Socket not connected");
      }
    },
    [socket, isConnected]
  );

  const getUserChats = useCallback(() => {
    if (socket && isConnected) {
      console.log("Getting user chats");
      socket.emit("getUserChats");
    } else {
      console.warn("Cannot get user chats: Socket not connected");
    }
  }, [socket, isConnected]);

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
