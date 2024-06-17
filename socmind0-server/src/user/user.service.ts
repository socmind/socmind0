// user.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as amqplib from 'amqplib';

@Injectable()
export class UserService {
  readonly microserviceId: string;
  private readonly exchange = 'fanout_exchange';

  constructor(
    @Inject('RABBITMQ_CHANNEL') private readonly channel: amqplib.Channel,
  ) {
    this.microserviceId = uuidv4();
  }

  async sendMessage(message: any) {
    try {
      const msg = {
        ...message,
        microserviceId: this.microserviceId,
      };
      this.channel.publish(this.exchange, '', Buffer.from(JSON.stringify(msg)));
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }
}
