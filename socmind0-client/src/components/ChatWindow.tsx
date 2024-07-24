// src/components/ChatWindow.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Socket, io } from 'socket.io-client';

interface Message {
  content: { text: string };
  type: 'MEMBER' | 'SYSTEM';
  chatId: string;
  senderId: string | null;
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const chatId = Array.isArray(params.chatId) ? params.chatId[0] : params.chatId;

  useEffect(() => {
    const newSocket = io('http://localhost:3001', {
      query: { userId: 'flynn' },
    });
    setSocket(newSocket);

    newSocket.emit('joinChat', chatId);

    newSocket.on('chatHistory', (history: Message[]) => {
      setMessages(history);
    });

    newSocket.on('newMessage', (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && socket) {
      const newMessage: Message = {
        content: { text: inputMessage },
        type: 'MEMBER',
        chatId,
        senderId: 'flynn'
      };
      socket.emit('sendMessage', { chatId, content: inputMessage });
      setMessages(prevMessages => [...prevMessages, newMessage]);
      setInputMessage('');
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${
              message.type === 'SYSTEM'
                ? 'text-center'
                : message.senderId === 'flynn'
                ? 'text-right'
                : 'text-left'
            }`}
          >
            {message.type === 'SYSTEM' ? (
              <span className="inline-block p-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm">
                {message.content.text}
              </span>
            ) : (
              <span
                className={`inline-block p-3 rounded-lg ${
                  message.senderId === 'flynn'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                {message.content.text}
              </span>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="p-4 bg-gray-100">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type a message..."
        />
      </form>
    </div>
  );
}