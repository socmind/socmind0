// src/hooks/useSocket.ts
import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socket) {
      socket = io("http://localhost:3001", { withCredentials: true });
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
