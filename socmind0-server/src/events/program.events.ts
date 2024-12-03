// src/events/program.events.ts
import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

export interface ProgramPauseStatus {
  paused: boolean;
  messageCount: number;
  threshold: number;
  isAutoPause: boolean;
}

@Injectable()
export class ProgramEvents {
  private pauseStatus = new Subject<ProgramPauseStatus>();
  private resumeProgram = new Subject<void>();

  // Observable streams
  pauseStatus$ = this.pauseStatus.asObservable();
  resumeProgram$ = this.resumeProgram.asObservable();

  // Event emitters
  emitPauseStatus(status: ProgramPauseStatus) {
    this.pauseStatus.next(status);
  }

  emitResumeProgram() {
    this.resumeProgram.next();
  }
}
