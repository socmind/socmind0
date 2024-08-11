// src/components/ChatInterface.tsx
import React, { useState } from "react";
import { useSocket } from "../hooks/useSocket";
import { useChatMessages } from "../hooks/useChatMessages";

interface ChatInterfaceProps {
  chatId: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ chatId }) => {
  const [inputMessage, setInputMessage] = useState("");
  const { sendMessage } = useSocket();
  const messages = useChatMessages(chatId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      sendMessage(chatId, inputMessage);
      setInputMessage("");
    }
  };

  return (
    <div className="chat-interface">
      <div className="message-list">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.senderId ? "user" : "ai"}`}
          >
            <span className="sender">{message.senderId || "AI"}: </span>
            <span className="content">{message.content}</span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};
