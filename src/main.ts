import './style.css';
import { CONTRACT_DEFS } from './data/contracts';
import { PachinkoSpikeController } from './app/PachinkoSpikeController';
import { createInitialRunState } from './core/run-state/createInitialRunState';
import { MatterPhysicsWorld } from './sim/matter/MatterPhysicsWorld';
import type { ViewDropLaneId } from './view/GameViewModel';
import { formatGameDebugSummary } from './view/debugSummary';
import { PixiGameView } from './view/pixi/PixiGameView';

const appElement = document.querySelector<HTMLDivElement>('#app');

if (appElement === null) {
  throw new Error('Missing #app root element.');
}

const runState = createInitialRunState(CONTRACT_DEFS.cleanStart);

appElement.innerHTML = `
  <main class="app-shell">
    <section class="game-panel" aria-label="Cauldron Claw placeholder">
      <div id="game-canvas" class="game-canvas"></div>
    </section>
    <aside class="debug-panel">
      <h1>Cauldron Claw</h1>
      <p>A debug pachinko spike for the alchemy machine prototype.</p>
      <fieldset class="lane-selector" aria-label="Drop lane">
        <legend>Drop Lane</legend>
        <label>
          <input type="radio" name="drop-lane" value="left" />
          Left
        </label>
        <label>
          <input type="radio" name="drop-lane" value="center" checked />
          Center
        </label>
        <label>
          <input type="radio" name="drop-lane" value="right" />
          Right
        </label>
      </fieldset>
      <div class="control-row">
        <button id="drop-herb" class="control-button" type="button">
          Drop Herb
        </button>
        <button id="reset-spike" class="control-button secondary" type="button">
          Reset Spike
        </button>
      </div>
      <h2>Debug Run State</h2>
      <pre id="debug-summary"></pre>
    </aside>
  </main>
`;

const canvasHost = document.querySelector<HTMLDivElement>('#game-canvas');
const debugSummary = document.querySelector<HTMLPreElement>('#debug-summary');
const dropHerbButton = document.querySelector<HTMLButtonElement>('#drop-herb');
const resetSpikeButton =
  document.querySelector<HTMLButtonElement>('#reset-spike');
const laneInputs =
  document.querySelectorAll<HTMLInputElement>('input[name="drop-lane"]');

if (
  canvasHost === null ||
  debugSummary === null ||
  dropHerbButton === null ||
  resetSpikeButton === null ||
  laneInputs.length !== 3
) {
  throw new Error('Missing app shell elements.');
}

const canvasContainer = canvasHost;
const debugOutput = debugSummary;
const dropButton = dropHerbButton;
const resetButton = resetSpikeButton;
const spikeController = new PachinkoSpikeController(
  new MatterPhysicsWorld(),
  runState,
);

const gameView = new PixiGameView();
await gameView.mount(canvasContainer);

let lastFrameTime = performance.now();

function render(viewModel = spikeController.getViewModel()): void {
  gameView.render(viewModel);
  debugOutput.textContent = formatGameDebugSummary(viewModel);
  dropButton.disabled = !viewModel.pachinko.canDrop;

  for (const input of laneInputs) {
    input.checked = input.value === viewModel.pachinko.selectedLaneId;
  }
}

function tick(frameTime: number): void {
  const deltaMs = Math.min(frameTime - lastFrameTime, 33);
  lastFrameTime = frameTime;

  render(spikeController.step(deltaMs));

  requestAnimationFrame(tick);
}

dropButton.addEventListener('click', () => {
  lastFrameTime = performance.now();
  render(spikeController.dropHerb());
});

resetButton.addEventListener('click', () => {
  lastFrameTime = performance.now();
  render(spikeController.clearSpike());
});

for (const input of laneInputs) {
  input.addEventListener('change', () => {
    if (!input.checked) {
      return;
    }

    lastFrameTime = performance.now();
    render(spikeController.selectDropLane(input.value as ViewDropLaneId));
  });
}

render();
requestAnimationFrame(tick);
