// src/components/ChatList.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Socket, io } from 'socket.io-client';

interface Chat {
  id: string;
  name: string;
}

export default function ChatList() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const router = useRouter();

  useEffect(() => {
    const newSocket = io('http://localhost:3001', {
      query: { userId: 'flynn' },
    });
    setSocket(newSocket);

    newSocket.on('newChat', (chat: Chat) => {
      setChats((prevChats) => [...prevChats, chat]);
    });

    // Fetch initial list of chats
    fetch('http://localhost:3001/api/chats')
      .then((res) => res.json())
      .then((data) => setChats(data));

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleChatClick = (chatId: string) => {
    router.push(`/chat/${chatId}`);
  };

  return (
    <div className="w-1/4 bg-gray-100 p-4">
      <h2 className="text-xl font-bold mb-4">Chats</h2>
      <ul>
        {chats.map((chat) => (
          <li
            key={chat.id}
            className="cursor-pointer hover:bg-gray-200 p-2 rounded"
            onClick={() => handleChatClick(chat.id)}
          >
            {chat.name}
          </li>
        ))}
      </ul>
    </div>
  );
}