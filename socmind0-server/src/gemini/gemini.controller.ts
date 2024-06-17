// gemini.controller.ts
import { Controller, Inject } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { GeminiService } from './gemini.service';
import { v4 as uuidv4 } from 'uuid';
import * as amqplib from 'amqplib';

@Controller()
export class GeminiController {
  private readonly microserviceId: string;
  private readonly exchange = 'fanout_exchange';

  constructor(
    private readonly geminiService: GeminiService,
    @Inject('RABBITMQ_CHANNEL') private readonly channel: amqplib.Channel,
  ) {
    this.microserviceId = uuidv4(); // Generate a unique ID for this microservice instance
  }

  async onModuleInit() {
    const queueName = 'gemini_queue';

    await this.channel.consume(queueName, async (msg) => {
      if (msg !== null) {
        const message = JSON.parse(msg.content.toString());
        await this.handleMessageReceived(message);
        this.channel.ack(msg);
      }
    });

    console.log('Waiting for messages in queue:', queueName);
  }

  async handleMessageReceived(@Payload() message: any) {
    // Ignore messages from the same microservice instance
    if (message.microserviceId === this.microserviceId) {
      return;
    }

    // console.log(`${message.content}\n`);

    try {
      const reply = await this.geminiService.reply(message);

      if (!reply) {
        return;
      }

      // console.log(`${reply.content}\n`);

      const msg = {
        ...reply,
        microserviceId: this.microserviceId,
      };
      this.channel.publish(this.exchange, '', Buffer.from(JSON.stringify(msg)));
    } catch (error) {
      console.error('Failed to process message:', error.message);
    }
  }
}
