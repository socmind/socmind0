// src/common/rabbitmq.module.ts
import { Module } from '@nestjs/common';
import * as amqplib from 'amqplib';

@Module({
  providers: [
    {
      provide: 'RABBITMQ_CHANNEL',
      useFactory: async () => {
        const connection = await amqplib.connect(process.env.RABBITMQ_URL);
        const channel = await connection.createChannel();

        const queueNames = [
          'user_queue',
          'gpt_queue',
          'claude_queue',
          'gemini_queue',
        ];
        const exchange = 'fanout_exchange';

        await channel.assertExchange(exchange, 'fanout', { durable: false });
        for (const queueName of queueNames) {
          await channel.assertQueue(queueName, { durable: false });
          await channel.bindQueue(queueName, exchange, '');
          await channel.purgeQueue(queueName); // Purge the queue on startup
        }

        return channel;
      },
    },
  ],
  exports: ['RABBITMQ_CHANNEL'],
})
export class RabbitMQModule {}
