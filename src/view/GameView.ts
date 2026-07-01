import type { GameViewModel } from './GameViewModel';

export interface GameView {
  mount(container: HTMLElement): Promise<void>;
  render(model: GameViewModel): void;
  destroy(): void;
}
