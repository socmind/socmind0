// src/app.gateway.ts
import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatAdmin } from 'src/chat/chat.admin';
import { ChatService } from 'src/chat/chat.service';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private userSocket: Socket | null = null;
  private readonly userId = 'flynn';
  private readonly logger = new Logger(AppGateway.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly chatAdmin: ChatAdmin,
  ) {}

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.userSocket = client;
    await this.sendUserChats();
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.userSocket = null;
  }

  @SubscribeMessage('getUserChats')
  async handleGetUserChats() {
    await this.sendUserChats();
  }

  @SubscribeMessage('joinChat')
  async handleJoinChat(client: Socket, chatId: string) {
    client.join(chatId);

    const history = await this.chatService.getConversationHistory(chatId);
    const formattedMessages = history.map((message) => ({
      content: message.content,
      messageType: message.type,
      chatId: message.chatId,
      senderId: message.senderId || undefined,
    }));

    client.emit('chatHistory', formattedMessages);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    client: Socket,
    payload: { chatId: string; content: string },
  ) {
    this.logger.log(`Sending user message to chatAdmin.`);
    await this.chatAdmin.sendMessage(
      payload.chatId,
      { text: payload.content },
      this.userId,
    );
  }

  private async sendUserChats() {
    if (!this.userSocket) {
      this.logger.warn('Attempted to send chats, but no user is connected');
      return;
    }

    try {
      const chats = await this.chatService.getMemberChats(this.userId);
      this.userSocket.emit('userChats', chats);
    } catch (error) {
      this.logger.error(`Error fetching user chats: ${error.message}`);
      this.userSocket.emit('error', { message: 'Failed to fetch user chats' });
    }
  }

  notifyNewChat(chatId: string) {
    this.logger.log(`New chat created: ${chatId}`);
    this.userSocket.emit('newChat', { chatId });
    this.sendUserChats();
  }

  sendMessageToUser(message: any) {
    const formattedMessage = {
      content: message.content,
      messageType: message.type,
      chatId: message.chatId,
      senderId: message.senderId || undefined,
    };
    this.userSocket.emit('newMessage', formattedMessage);
  }

  sendTypingIndicator(chatId: string, memberId: string, isTyping: boolean) {
    this.userSocket.emit('typingIndicator', { chatId, memberId, isTyping });
  }
}
