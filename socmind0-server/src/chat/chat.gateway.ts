import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private chatService: ChatService) {}

  @SubscribeMessage('joinChat')
  async handleJoinChat(client: Socket, chatId: string) {
    // Add user to chat room
    client.join(chatId);
    // Send initial chat history
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    client: Socket,
    payload: { chatId: string; content: string },
  ) {
    const userId = client.data.userId; // Assuming user ID is stored in socket data
    await this.chatService.sendMessage(payload.chatId, payload.content, {
      senderId: userId,
    });
    // Message will be broadcast to all clients in the chat room by ChatService
  }
}
