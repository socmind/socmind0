// src/app/page.tsx
import ChatList from '../components/ChatList';

export default function Home() {
  return (
    <div className="flex h-screen">
      <ChatList />
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-500">Select a chat to start messaging</p>
      </div>
    </div>
  );
}