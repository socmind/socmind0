// src/program/program.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatModule } from 'src/chat/chat.module';
import { ProgramService } from './program.service';
import { AdminState } from './admin/admin.state';
import { GptState } from './gpt/gpt.state';
import { ClaudeState } from './claude/claude.state';
import { GeminiState } from './gemini/gemini.state';
import { ProgramController } from './program.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ChatModule,
  ],
  providers: [ProgramService, AdminState, GptState, ClaudeState, GeminiState],
  controllers: [ProgramController],
})
export class ProgramModule {}
