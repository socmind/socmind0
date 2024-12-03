// src/events/events.module.ts
import { Global, Module } from '@nestjs/common';
import { ProgramEvents } from './program.events';

@Global()
@Module({
  providers: [ProgramEvents],
  exports: [ProgramEvents],
})
export class EventsModule {}
