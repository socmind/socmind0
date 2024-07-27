// // src/agents/gemini/gemini.module.ts
// import { Module } from '@nestjs/common';
// import { ConfigModule } from '@nestjs/config';
// import { ChatModule } from 'src/chat/chat.module';
// import { GeminiState } from './gemini.state';
// import { GeminiService } from './gemini.service';

// @Module({
//   imports: [
//     ConfigModule.forRoot({
//       isGlobal: true,
//     }),
//     ChatModule,
//   ],
//   providers: [GeminiService, GeminiState],
// })
// export class GeminiModule {}
