// src/user/user.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from 'src/chat/chat.service';

@WebSocketGateway()
export class UserGateway {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, Socket> = new Map();
  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    this.userSockets.set(userId, client);
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    this.userSockets.delete(userId);
  }

  @SubscribeMessage('joinChat')
  async handleJoinChat(client: Socket, chatId: string) {
    client.join(chatId);

    // Fetch and send chat history
    const history = await this.chatService.getConversationHistory(chatId);
    client.emit('chatHistory', history);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    client: Socket,
    payload: { chatId: string; content: string },
  ) {
    const userId = client.handshake.query.userId as string;
    await this.sendMessage(payload.chatId, payload.content, userId);
  }

  async sendMessage(chatId: string, content: string, userId: string) {
    await this.chatService.sendMessage(
      chatId,
      { text: content },
      { senderId: userId },
    );
  }

  sendMessageToUser(userId: string, chatId: string, message: any) {
    const userSocket = this.userSockets.get(userId);
    if (userSocket) {
      userSocket.emit('newMessage', { chatId, message });
    }
  }

  notifyNewChat(userId: string, chatId: string) {
    const userSocket = this.userSockets.get(userId);
    if (userSocket) {
      userSocket.emit('newChat', { chatId });
    }
  }
}
