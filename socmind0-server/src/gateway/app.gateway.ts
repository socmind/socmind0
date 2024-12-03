// src/app.gateway.ts
import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  MessageBody,
} from '@nestjs/websockets';
import { Message } from '@prisma/client';
import { Server, Socket } from 'socket.io';
import { ChatAdmin } from 'src/chat/chat.admin';
import { ChatService } from 'src/chat/chat.service';
import { ProgramEvents } from 'src/events/program.events';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;
  private userSocket: Socket | null = null;
  private readonly userId = 'flynn';
  private readonly logger = new Logger(AppGateway.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly chatAdmin: ChatAdmin,
    private readonly programEvents: ProgramEvents,
  ) {}

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
    
    // Subscribe to program events
    this.programEvents.pauseStatus$.subscribe((status) => {
      if (this.userSocket) {
        this.userSocket.emit('program:pause-status', status);
      }
    });
  }

  async handleConnection(client: Socket) {
    this.userSocket = client;
    this.logger.log(`Client connected: ${client.id}`);
    await this.sendInitialData();
  }

  handleDisconnect(client: Socket) {
    this.userSocket = null;
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('chats')
  async handleChats() {
    const chats = await this.chatService.getAllChats();
    return { event: 'chats', data: chats };
  }

  @SubscribeMessage('chatHistory')
  async handleChatHistory(@MessageBody() chatId: string) {
    const messages = await this.chatService.getConversationHistory(chatId);
    return { event: 'chatHistory', data: { chatId, messages } };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() payload: { chatId: string; content: string },
  ) {
    this.logger.log(`Sending user message to chatAdmin.`);
    await this.chatAdmin.sendMessage(
      payload.chatId,
      { text: payload.content },
      this.userId,
    );
  }

  async sendInitialData() {
    const data = await this.chatService.getInitialChatData();
    this.userSocket?.emit('initialData', data);
  }

  async sendNewChatToUser(chatId: string) {
    const chat = await this.chatService.getChatWithMembers(chatId);
    this.userSocket?.emit('newChat', chat);
  }

  sendMessageToUser(message: Message) {
    this.userSocket?.emit('newMessage', message);
  }

  sendTypingIndicator(chatId: string, memberId: string, isTyping: boolean) {
    this.userSocket?.emit('typingIndicator', { chatId, memberId, isTyping });
  }

  @SubscribeMessage('resumeProgram')
  handleResumeProgram() {
    this.programEvents.emitResumeProgram();
  }
}
