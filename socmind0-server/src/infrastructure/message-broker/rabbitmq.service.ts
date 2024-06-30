// src/infrastructure/message-broker/rabbitmq.service.ts
import { Injectable } from '@nestjs/common';
import * as amqplib from 'amqplib';

@Injectable()
export class RabbitMQService {
  private connection: amqplib.Connection;
  private channel: amqplib.Channel;

  constructor() {
    this.init();
  }

  async init() {
    this.connection = await amqplib.connect(process.env.RABBITMQ_URL);
    this.channel = await this.connection.createChannel();
  }

  async createGroupChat(chatId: string, members: string[]) {
    const exchange = `chat_${chatId}_exchange`;
    await this.channel.assertExchange(exchange, 'fanout', { durable: true });

    for (const member of members) {
      const queueName = `${member}_${chatId}`;
      await this.channel.assertQueue(queueName, { durable: true });
      await this.channel.bindQueue(queueName, exchange, '');
    }
  }
}
