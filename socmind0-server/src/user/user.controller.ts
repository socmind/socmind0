// user.controller.ts
import { Controller, Inject } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { UserService } from './user.service';
import * as amqplib from 'amqplib';

@Controller()
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject('RABBITMQ_CHANNEL') private readonly channel: amqplib.Channel,
  ) {}

  async onModuleInit() {
    const queueName = 'user_queue';

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
    if (message.microserviceId === this.userService.microserviceId) {
      return;
    }

    console.log(`${message.content}\n`);
  }
}
