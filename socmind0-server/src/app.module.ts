// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GptModule } from './agents/gpt/gpt.module';
import { UserModule } from './user/user.module';
import { ChatModule } from './chat/chat.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ChatModule,
    UserModule,
    GptModule,
    SeedModule,
  ],
})
export class AppModule {}
