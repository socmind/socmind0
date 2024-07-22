// src/components/ChatWindow.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Socket, io } from 'socket.io-client';

interface Message {
  id: string;
  content: { text: string };
  senderId: string;
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { chatId } = useParams();

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
      socket.emit('sendMessage', { chatId, content: inputMessage });
      setInputMessage('');
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-2 ${
              message.senderId === 'flynn' ? 'text-right' : 'text-left'
            }`}
          >
            <span
              className={`inline-block p-2 rounded ${
                message.senderId === 'flynn'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-300'
              }`}
            >
              {message.content.text}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="p-4 bg-gray-100">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Type a message..."
        />
      </form>
    </div>
  );
}