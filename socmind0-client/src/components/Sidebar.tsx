import { mockMessages } from "@/data/mockData";
import { Chat } from "@/types";
import { Search } from "lucide-react";

interface SidebarProps {
  chats: Chat[];
  selectedChat: Chat;
  onChatSelect: (chat: Chat) => void;
}

function getRecentMessage(chatId: string): string {
  const messages = mockMessages[chatId];
  return messages && messages.length > 0
    ? messages[messages.length - 1].content.text
    : "";
}

function getChatDisplayName(chat: Chat): string {
  return chat.name || `Chat with ${chat.memberIds.join(", ")}`;
}

export function Sidebar({
  chats,
  selectedChat,
  onChatSelect,
}: SidebarProps): JSX.Element {
  return (
    <div className="w-1/6 bg-white border-r flex flex-col">
      <div className="p-4 border-b">
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2 border rounded-md"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`flex items-center p-4 h-20 cursor-pointer ${
              selectedChat.id === chat.id ? "bg-blue-100" : ""
            }`}
            onClick={() => onChatSelect(chat)}
          >
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <span className="text-lg font-semibold">
                {getChatDisplayName(chat)[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">
                {getChatDisplayName(chat)}
              </h3>
              <p className="text-sm text-gray-500 truncate">
                {getRecentMessage(chat.id)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
