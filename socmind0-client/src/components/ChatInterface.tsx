// src/components/ChatInterface.tsx
import React, { useState, useRef, useEffect } from "react";
import { useSocket } from "../hooks/useSocket";
import { useChatMessages } from "../hooks/useChatMessages";
import ReactMarkdown from "react-markdown";

interface ChatInterfaceProps {
  chatId: string;
}

interface Message {
  id: string;
  content: { text: string };
  senderId: string | null;
  chatId: string;
  createdAt: Date;
  type: "MEMBER" | "SYSTEM";
}

const generateColor = (senderId: string) => {
  let hash = 0;
  for (let i = 0; i < senderId.length; i++) {
    hash = senderId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 80%)`;
};

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ chatId }) => {
  const [inputMessage, setInputMessage] = useState("");
  const { sendMessage } = useSocket();
  const messages = useChatMessages(chatId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      sendMessage(chatId, inputMessage);
      setInputMessage("");
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`;
    }
  }, [inputMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className="chat-interface flex flex-col h-screen">
      <div className="message-list flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((message: Message) => (
          <div
            key={message.id}
            className={`flex ${
              message.senderId === "flynn" ? "justify-end" : "justify-start"
            } ${message.type === "SYSTEM" ? "justify-center" : ""}`}
          >
            {message.type === "MEMBER" ? (
              <div
                className={`max-w-3/4 p-3 rounded-lg ${
                  message.senderId === "flynn" ? "bg-blue-200" : "bg-gray-200"
                }`}
                style={{
                  backgroundColor:
                    message.senderId !== "flynn"
                      ? generateColor(message.senderId || "")
                      : undefined,
                }}
              >
                {message.senderId && message.senderId !== "flynn" && (
                  <div className="font-bold mb-1">{message.senderId}</div>
                )}
                <ReactMarkdown className="prose max-w-none">
                  {message.content.text}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic max-w-3/4 text-center">
                <ReactMarkdown className="prose max-w-none">
                  {message.content.text}
                </ReactMarkdown>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="p-4 bg-gray-100">
        <div className="flex">
          <textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-grow px-3 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-y-auto"
            style={{ maxHeight: "200px", minHeight: "40px" }}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};
