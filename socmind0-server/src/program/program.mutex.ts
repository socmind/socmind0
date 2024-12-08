import { Injectable } from '@nestjs/common';

@Injectable()
export class LastInWinsMutex {
  private locked: boolean = false;
  private waitingPromise: Promise<void> | null = null;
  private waitingResolve: (() => void) | null = null;
  private waitingReject: ((reason?: any) => void) | null = null;

  async acquire(): Promise<() => void> {
    if (!this.locked) {
      this.locked = true;
      return () => this.release();
    }

    // If there's already a waiting promise, reject it
    if (this.waitingPromise) {
      if (this.waitingReject) {
        this.waitingReject(new Error('Lock acquisition canceled by a newer call.'));
      }
      this.waitingPromise = null;
      this.waitingResolve = null;
      this.waitingReject = null;
    }

    // Create a new waiting promise for the latest caller
    this.waitingPromise = new Promise<void>((resolve, reject) => {
      this.waitingResolve = resolve;
      this.waitingReject = reject;
    });

    // Wait for the lock to be released
    await this.waitingPromise;
    this.locked = true;
    return () => this.release();
  }

  private release(): void {
    if (this.waitingPromise) {
      // If there's a waiting promise, resolve it
      if (this.waitingResolve) this.waitingResolve();
      this.waitingPromise = null;
      this.waitingResolve = null;
    } else {
      // If no waiting promise, unlock
      this.locked = false;
    }
  }

  isLocked(): boolean {
    return this.locked;
  }

  hasWaiting(): boolean {
    return this.waitingPromise !== null;
  }
}
