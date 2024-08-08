import { Injectable } from '@nestjs/common';

@Injectable()
export class LastInWinsMutex {
  private locked: boolean = false;
  private waitingPromise: Promise<void> | null = null;
  private waitingResolve: (() => void) | null = null;

  async acquire(): Promise<() => void> {
    if (!this.locked) {
      this.locked = true;
      return () => this.release();
    }

    // If there's already a waiting promise, replace it
    if (this.waitingPromise) {
      // Resolve the old promise to prevent memory leaks
      if (this.waitingResolve) this.waitingResolve();
    }

    // Create a new promise
    this.waitingPromise = new Promise<void>((resolve) => {
      this.waitingResolve = resolve;
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
