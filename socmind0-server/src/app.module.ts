// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GeminiModule } from './gemini/gemini.module';
import { GptModule } from './gpt/gpt.module';
import { ClaudeModule } from './claude/claude.module';
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
