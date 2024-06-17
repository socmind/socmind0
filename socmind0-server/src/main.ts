// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UserService } from './user/user.service';
import * as readline from 'readline';

async function bootstrap() {
  try {
    const appContext = await NestFactory.createApplicationContext(AppModule);
    const userService = appContext.get(UserService);

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    // Prompt the user for an initial message
    rl.question('Please enter your initial message: ', async (input) => {
      const initialMessage = {
        role: 'user',
        content: `Theo: ${input}`,
      };
      await userService.sendMessage(initialMessage);

      // Continue listening for further user inputs
      rl.on('line', async (input) => {
        const message = {
          role: 'user',
          content: `Theo: ${input}`,
        };
        await userService.sendMessage(message);
      });

      rl.on('close', () => {
        console.log('User input closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Error starting the microservices:', error);
  }
}

bootstrap();
