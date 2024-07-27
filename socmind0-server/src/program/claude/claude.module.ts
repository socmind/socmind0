// // src/agents/claude/claude.module.ts
// import { Module } from '@nestjs/common';
// import { ConfigModule } from '@nestjs/config';
// import { ClaudeState } from './claude.state';
// import { ClaudeService } from './claude.service';
// import { ChatModule } from 'src/chat/chat.module';

// @Module({
//   imports: [
//     ConfigModule.forRoot({
//       isGlobal: true,
//     }),
//     ChatModule,
//   ],
//   providers: [ClaudeService, ClaudeState],
// })
// export class ClaudeModule {}
