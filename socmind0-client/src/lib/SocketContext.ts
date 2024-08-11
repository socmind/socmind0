// lib/SocketContext.ts
import { createContext } from 'react';
import { Socket } from 'socket.io-client';

export interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  sendMessage: (chatId: string, content: string) => void;
  joinChat: (chatId: string) => void;
  getUserChats: () => void;
}

export const SocketContext = createContext<SocketContextType | null>(null);