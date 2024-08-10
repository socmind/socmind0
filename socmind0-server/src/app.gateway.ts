// src/app.gateway.ts
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
  private readonly userId = 'flynn';

  constructor(
    private readonly chatService: ChatService,
    private readonly chatAdmin: ChatAdmin,
  ) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
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
    console.log(`Sending user message to chatAdmin.`);
    await this.chatAdmin.sendMessage(
      payload.chatId,
      { text: payload.content },
      this.userId,
    );
  }

  sendMessageToUser(message: any) {
    const formattedMessage = {
      content: message.content,
      messageType: message.type,
      chatId: message.chatId,
      senderId: message.senderId || undefined,
    };
    this.server.emit('newMessage', formattedMessage);
  }

  notifyNewChat(chatId: string) {
    this.server.emit('newChat', { chatId });
  }

  sendTypingIndicator(chatId: string, memberId: string, isTyping: boolean) {
    this.server.emit('typingIndicator', { chatId, memberId, isTyping });
  }
}
