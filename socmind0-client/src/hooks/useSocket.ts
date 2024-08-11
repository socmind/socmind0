// hooks/useSocket.ts
"use client";
import { useContext } from "react";
import { SocketContext, SocketContextType } from "../lib/SocketContext";

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === null) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
