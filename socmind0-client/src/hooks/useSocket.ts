// src/hooks/useSocket.ts
import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";

const api_url = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

let socket: Socket | null = null;

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socket) {
      socket = io(api_url, { withCredentials: true });
    }

    socket.on("connect", () => {
      setIsConnected(true);
      console.log("Socket connected: ", socket?.id);
    });
    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Socket disconnected: ", socket?.id);
    });

    return () => {
      if (socket) {
        socket.off("connect");
        socket.off("disconnect");
      }
    };
  }, []);

  const disconnect = () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  };

  return { socket, isConnected };
};
