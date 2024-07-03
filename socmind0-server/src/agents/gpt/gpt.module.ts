// src/agents/gpt/gpt.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GptState } from './gpt.state';
import { GptService } from './gpt.service';
import { ChatModule } from 'src/chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ChatModule,
  ],
  providers: [GptService, GptState],
})
export class GptModule {}
