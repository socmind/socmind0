// src/program/program.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatModule } from 'src/chat/chat.module';
import { ProgramService } from './program.service';
import { ProgramController } from './program.controller';
import { LastInWinsMutex } from './program.mutex';
import { GptState } from './gpt/gpt.state';
import { ClaudeState } from './claude/claude.state';
import { GeminiState } from './gemini/gemini.state';
import { AppGateway } from 'src/app.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ChatModule,
  ],
  providers: [
    ProgramService,
    LastInWinsMutex,
    GptState,
    ClaudeState,
    GeminiState,
    AppGateway,
  ],
  controllers: [ProgramController],
})
export class ProgramModule {}
