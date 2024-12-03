// src/program/program.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ProgramService } from './program.service';

@Controller('api/program')
export class ProgramController {
  constructor(private readonly programService: ProgramService) {}

  @Post('set-chat-delay')
  @HttpCode(HttpStatus.OK)
  setDelay(@Body('delay') delay: number) {
    this.programService.setDelay(delay);
    return { message: `Delay set to ${delay} milliseconds` };
  }

  @Post('pause-chat')
  @HttpCode(HttpStatus.OK)
  pause() {
    this.programService.pause();
    return { message: 'Message handling paused' };
  }

  @Post('resume-chat')
  @HttpCode(HttpStatus.OK)
  async resume() {
    await this.programService.resume();
    return { message: 'Message handling resumed' };
  }

  @Post('set-auto-pause')
  @HttpCode(HttpStatus.OK)
  setAutoPause(
    @Body('enabled') enabled: boolean,
    @Body('threshold') threshold?: number,
  ) {
    this.programService.setAutoPause(enabled, threshold);
    return {
      message: `Auto-pause ${enabled ? 'enabled' : 'disabled'}${
        enabled && threshold ? ` with threshold of ${threshold} messages` : ''
      }`,
    };
  }

  @Post('auto-pause-status')
  @HttpCode(HttpStatus.OK)
  getAutoPauseStatus() {
    return this.programService.getAutoPauseStatus();
  }
}
