// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GeminiModule } from './agents/gemini/gemini.module';
import { GptModule } from './agents/gpt/gpt.module';
import { ClaudeModule } from './agents/claude/claude.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GptModule,
    GeminiModule,
    ClaudeModule,
    UserModule,
  ],
})
export class AppModule {}
