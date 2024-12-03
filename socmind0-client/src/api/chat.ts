// API client for chat endpoints
import { Member, Chat } from '../types';

const API_BASE_URL = 'http://localhost:3001';

interface CreateChatData {
  memberIds: string[];
  name?: string;
  topic?: string;
  creator?: string;
  context?: string;
}

export const chatApi = {
  /**
   * Get all chat members
   */
  getAllMembers: async (): Promise<Member[]> => {
    const response = await fetch(`${API_BASE_URL}/chat/members`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch members: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Create a new chat
   */
  createChat: async (chatData: CreateChatData): Promise<Chat> => {
    const response = await fetch(`${API_BASE_URL}/chat/create`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(chatData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create chat: ${response.statusText}`);
    }

    return response.json();
  },
};
