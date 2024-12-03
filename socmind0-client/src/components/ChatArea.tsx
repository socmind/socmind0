// src/components/ChatArea.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Chat, Message } from "@/types";

interface ChatAreaProps {
  selectedChat: Chat;
  messages: Message[];
  onSendMessage: (chatId: string, message: Message) => void;
}

export function ChatArea({
  selectedChat,
  messages,
  onSendMessage,
}: ChatAreaProps): JSX.Element {
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const userId = "flynn";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputMessage]);

  const getChatDisplayName = (chat: Chat): string => {
    return chat.name || `Chat with ${chat.memberIds.join(", ")}`;
  };

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const newMessage: Message = {
        id: `msg_${Date.now()}`,
        type: "MEMBER",
        senderId: userId,
        chatId: selectedChat.id,
        content: { text: inputMessage.trim() },
        createdAt: new Date().toISOString(),
      };
      onSendMessage(selectedChat.id, newMessage);
      setInputMessage("");
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-white p-4 shadow">
        <h2 className="font-semibold">
          To: {getChatDisplayName(selectedChat)}
        </h2>
        <p className="text-sm text-gray-500">
          {selectedChat.memberIds.join(", ")}
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) =>
          message.type === "SYSTEM" ? (
            <SystemMessage key={message.id} message={message} />
          ) : (
            <MessageBubble
              key={message.id}
              message={message}
              isUser={message.senderId === userId}
            />
          )
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="bg-white p-4 border-t">
        <div className="flex items-center">
          <textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Shift+Enter for new line)"
            className="flex-1 border rounded-lg py-2 px-4 mr-2 max-h-32 min-h-[2.5rem] resize-none overflow-y-auto break-words"
            rows={1}
            style={{ width: "calc(100% - 3rem)" }}
          />
          <button
            onClick={handleSendMessage}
            className="bg-blue-500 text-white rounded-full p-2 h-10 w-10 flex items-center justify-center flex-shrink-0"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: Message;
  isUser: boolean;
}

function MessageBubble({ message, isUser }: MessageBubbleProps): JSX.Element {
  const bubbleClass = isUser
    ? "bg-blue-500 text-white"
    : "bg-gray-200 text-black";

  return (
    <div className={`flex mb-4 ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex items-end max-w-[70%] ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {!isUser && message.senderId && (
          <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center text-xs font-semibold">
            {message.senderId.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div
          className={`flex flex-col ${
            isUser ? "items-end" : "items-start ml-2"
          }`}
        >
          {!isUser && message.senderId && (
            <span className="text-xs text-gray-500 mb-1">
              {message.senderId}
            </span>
          )}
          <div
            className={`py-1 px-3 rounded-2xl ${bubbleClass} break-words min-h-8 flex items-center`}
          >
            <span>{message.content.text}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SystemMessageProps {
  message: Message;
}

function SystemMessage({ message }: SystemMessageProps): JSX.Element {
  return (
    <div className="flex justify-center my-2">
      <span className="text-xs text-gray-500">{message.content.text}</span>
    </div>
  );
}
