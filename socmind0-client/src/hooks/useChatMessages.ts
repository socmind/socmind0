// hooks/useChatMessages.ts
import { useState, useEffect } from "react";
import { useSocket } from "./useSocket";

interface Message {
  id: string;
  content: { text: string };
  senderId: string | null;
  chatId: string;
  createdAt: Date;
  type: "MEMBER" | "SYSTEM";
}

export const useChatMessages = (chatId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const { socket, joinChat } = useSocket();

  useEffect(() => {
    if (socket) {
      joinChat(chatId);

      socket.on("chatHistory", (history: Message[]) => {
        setMessages(history);
      });

      socket.on("newMessage", (message: Message) => {
        if (message.chatId === chatId) {
          setMessages((prevMessages) => [...prevMessages, message]);
        }
      });

      return () => {
        socket.off("chatHistory");
        socket.off("newMessage");
      };
    }
  }, [socket, chatId, joinChat]);

  return messages;
};
