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
  const [isPaused, setIsPaused] = useState(false);
  const [currentDelay, setCurrentDelay] = useState(0);
  const BACKEND_URL = 'http://localhost:3001';

  useEffect(() => {
    const newSocket = io(BACKEND_URL, {
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

  const setDelay = async (delay: number) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/program/set-chat-delay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ delay }),
      });
      if (!response.ok) throw new Error('Failed to set delay');
      const data = await response.json();
      console.log(data.message);
      setCurrentDelay(delay);
    } catch (error) {
      console.error('Error setting delay:', error);
    }
  };

  const togglePause = async () => {
    try {
      const endpoint = isPaused ? 'resume-chat' : 'pause-chat';
      const response = await fetch(`${BACKEND_URL}/api/program/${endpoint}`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to toggle pause');
      const data = await response.json();
      console.log(data.message);
      setIsPaused(!isPaused);
    } catch (error) {
      console.error('Error toggling pause:', error);
    }
  };

  const getButtonClass = (delay: number) => {
    const baseClass = "px-4 py-2 text-white rounded mr-2 ";
    const activeClass = "ring-2 ring-offset-2 ring-offset-gray-100 ring-white ";
    if (currentDelay === delay) {
      return baseClass + activeClass + (
        delay === 0 ? "bg-green-600" :
        delay === 5000 ? "bg-yellow-600" :
        "bg-red-600"
      );
    }
    return baseClass + (
      delay === 0 ? "bg-green-500" :
      delay === 5000 ? "bg-yellow-500" :
      "bg-red-500"
    );
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 bg-gray-200 flex justify-between items-center">
        <div>
          <button onClick={() => setDelay(0)} className={getButtonClass(0)}>Fast</button>
          <button onClick={() => setDelay(3000)} className={getButtonClass(5000)}>Medium</button>
          <button onClick={() => setDelay(5000)} className={getButtonClass(15000)}>Slow</button>
        </div>
        <button 
          onClick={togglePause} 
          className={`p-2 ${isPaused ? 'bg-blue-500' : 'bg-gray-500'} text-white rounded`}
          aria-label={isPaused ? "Resume" : "Pause"}
        >
          {isPaused ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
          )}
        </button>
      </div>
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
              <div className="flex flex-col">
                <span className={`text-xs mb-1 ${message.senderId === 'flynn' ? 'text-right' : 'text-left'}`}>
                  {message.senderId}
                </span>
                <span
                  className={`inline-block p-3 rounded-lg ${
                    message.senderId === 'flynn'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {message.content.text}
                </span>
              </div>
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