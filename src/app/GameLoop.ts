export interface GameLoop {
  start(): void;
  stop(): void;
}

export class NoopGameLoop implements GameLoop {
  start(): void {
    return;
  }

  stop(): void {
    return;
  }
}

