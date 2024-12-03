// src/components/Sidebar.tsx
"use client";

import { useState, useEffect } from "react";
import { Chat, Member } from "@/types";
import { Plus } from "lucide-react";
import { chatApi } from "@/api/chat";

interface SidebarProps {
  chats: Chat[];
  selectedChat: Chat | null;
  onChatSelect: (chat: Chat) => void;
  onNewChat: (chat: Chat) => void;
}

function getLastMessage(chat: Chat): string {
  return chat.lastMessage?.content.text ?? "";
}

function getChatDisplayName(chat: Chat): string {
  return chat.name ?? `Chat with ${chat.memberIds.join(", ")}`;
}

export function Sidebar({
  chats,
  selectedChat,
  onChatSelect,
  onNewChat,
}: SidebarProps): JSX.Element {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const userId = "flynn";

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const membersList = await chatApi.getAllMembers();
        setMembers(membersList);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch members');
      }
    };

    fetchMembers();
  }, []);

  const handleNewChatClick = () => {
    setIsDropdownOpen(true);
    setSelectedMembers([]);
    setError(null);
  };

  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleCreateChat = async () => {
    if (selectedMembers.length === 0) {
      setError('Please select at least one member');
      return;
    }

    try {
      const newChat = await chatApi.createChat({
        memberIds: [...selectedMembers, userId],
        name: `Chat ${chats.length + 1}`,
      });

      onNewChat(newChat);
      setIsDropdownOpen(false);
      setSelectedMembers([]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create chat');
    }
  };

  return (
    <div className="w-1/6 bg-white border-r flex flex-col">
      <div className="p-4 border-b relative">
        <button
          onClick={handleNewChatClick}
          className="w-full flex items-center justify-center bg-blue-500 text-white rounded-md py-2 hover:bg-blue-600 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          New Chat
        </button>

        {/* Member Selection Dropdown */}
        {isDropdownOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border rounded-md shadow-lg mt-1 z-50">
            <div className="p-3 border-b">
              <h3 className="font-semibold text-gray-700">Select Members</h3>
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
            <div className="max-h-60 overflow-y-auto">
              {members
                .filter(member => member.type === "PROGRAM")
                .map((member) => (
                <div
                  key={member.id}
                  className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleMemberToggle(member.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(member.id)}
                    onChange={() => { }}
                    className="mr-3"
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{member.name}</span>
                    <span className="text-sm text-gray-500">{member.id}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t flex justify-end space-x-2">
              <button
                onClick={() => setIsDropdownOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateChat}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
                disabled={selectedMembers.length === 0}
              >
                Create
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`flex items-center p-4 h-20 cursor-pointer ${selectedChat && selectedChat.id === chat.id ? "bg-blue-100" : ""
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
                {getLastMessage(chat)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
