import { useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { Chat, Message } from "@/types";

interface ChatAreaProps {
  selectedChat: Chat;
  messages: Message[];
}

export function ChatArea({
  selectedChat,
  messages,
}: ChatAreaProps): JSX.Element {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getChatDisplayName = (chat: Chat): string => {
    return chat.name || `Chat with ${chat.memberIds.join(", ")}`;
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
              isUser={message.senderId === "Me"}
            />
          )
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="bg-white p-4 border-t">
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 border rounded-full py-2 px-4 mr-2"
          />
          <button className="bg-blue-500 text-white rounded-full p-2">
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
