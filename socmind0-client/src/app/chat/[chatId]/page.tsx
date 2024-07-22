// src/app/chat/[chatId]/page.tsx
import { Suspense } from 'react';
import ChatList from '../../../components/ChatList';
import ChatWindow from '../../../components/ChatWindow';

export default function ChatPage() {
  return (
    <div className="flex h-screen">
      <Suspense fallback={<div>Loading chats...</div>}>
        <ChatList />
      </Suspense>
      <Suspense fallback={<div>Loading chat...</div>}>
        <ChatWindow />
      </Suspense>
    </div>
  );
}