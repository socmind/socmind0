// src/app/chat/[chatId]/page.tsx
import { ChatInterface } from "../../../components/ChatInterface";

export default function ChatPage({ params }: { params: { chatId: string } }) {
  return (
    <div>
      <h1>Chat: {params.chatId}</h1>
      <ChatInterface chatId={params.chatId} />
    </div>
  );
}
