import './style.css';
import { CONTRACT_DEFS } from './data/contracts';
import { PachinkoSpikeController } from './app/PachinkoSpikeController';
import { isSpikeQueuedIngredientKind } from './app/pachinko-spike/spikeIngredientQueueState';
import {
  isSpikeClawPositionId,
  isSpikeDebugVatId,
} from './app/pachinko-spike/spikeConfig';
import { createInitialRunState } from './core/run-state/createInitialRunState';
import { MatterPhysicsWorld } from './sim/matter/MatterPhysicsWorld';
import type {
  ViewClawPositionId,
  ViewDebugVatId,
  ViewDropLaneId,
} from './view/GameViewModel';
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
      <fieldset class="ingredient-selector" aria-label="Ingredient">
        <legend>Ingredient</legend>
        <label>
          <input type="radio" name="drop-ingredient" value="herb" checked />
          Herb
        </label>
        <label>
          <input type="radio" name="drop-ingredient" value="bone" />
          Bone
        </label>
        <label>
          <input type="radio" name="drop-ingredient" value="mushroom" />
          Mushroom
        </label>
      </fieldset>
      <div class="control-row">
        <button id="drop-ingredient" class="control-button" type="button">
          Drop Selected Ingredient
        </button>
      </div>
      <fieldset class="claw-selector" aria-label="Claw position">
        <legend>Claw Position</legend>
        <label>
          <input type="radio" name="claw-position" value="left" />
          Left
        </label>
        <label>
          <input type="radio" name="claw-position" value="center" checked />
          Center
        </label>
        <label>
          <input type="radio" name="claw-position" value="right" />
          Right
        </label>
      </fieldset>
      <div class="control-row">
        <button id="grab-claw" class="control-button" type="button" disabled>
          Grab
        </button>
      </div>
      <fieldset class="vat-selector" aria-label="Debug vat">
        <legend>Debug Vat</legend>
        <label>
          <input type="radio" name="debug-vat" value="healing" checked />
          Healing
        </label>
        <label>
          <input type="radio" name="debug-vat" value="bone" />
          Bone
        </label>
        <label>
          <input type="radio" name="debug-vat" value="poison" />
          Poison
        </label>
      </fieldset>
      <div class="control-row">
        <button id="submit-batch" class="control-button" type="button" disabled>
          Submit Batch
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
const dropIngredientButton =
  document.querySelector<HTMLButtonElement>('#drop-ingredient');
const grabClawButton =
  document.querySelector<HTMLButtonElement>('#grab-claw');
const submitBatchButton =
  document.querySelector<HTMLButtonElement>('#submit-batch');
const resetSpikeButton =
  document.querySelector<HTMLButtonElement>('#reset-spike');
const laneInputs =
  document.querySelectorAll<HTMLInputElement>('input[name="drop-lane"]');
const ingredientInputs = document.querySelectorAll<HTMLInputElement>(
  'input[name="drop-ingredient"]',
);
const clawPositionInputs = document.querySelectorAll<HTMLInputElement>(
  'input[name="claw-position"]',
);
const vatInputs =
  document.querySelectorAll<HTMLInputElement>('input[name="debug-vat"]');

if (
  canvasHost === null ||
  debugSummary === null ||
  dropIngredientButton === null ||
  grabClawButton === null ||
  submitBatchButton === null ||
  resetSpikeButton === null ||
  laneInputs.length !== 3 ||
  ingredientInputs.length !== 3 ||
  clawPositionInputs.length !== 3 ||
  vatInputs.length !== 3
) {
  throw new Error('Missing app shell elements.');
}

const canvasContainer = canvasHost;
const debugOutput = debugSummary;
const dropButton = dropIngredientButton;
const grabButton = grabClawButton;
const submitButton = submitBatchButton;
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
  grabButton.disabled = !viewModel.pachinko.claw.canGrab;
  submitButton.disabled = !viewModel.pachinko.vat.canSubmit;

  for (const input of laneInputs) {
    input.checked = input.value === viewModel.pachinko.selectedLaneId;
  }

  for (const input of ingredientInputs) {
    input.checked = input.value === viewModel.pachinko.selectedIngredientKind;
    input.disabled = viewModel.pachinko.ingredientQueue.some(
      (entry) => entry.kind === input.value && entry.dropped,
    );
  }

  for (const input of clawPositionInputs) {
    input.checked = input.value === viewModel.pachinko.claw.selectedPositionId;
  }

  for (const input of vatInputs) {
    input.checked = input.value === viewModel.pachinko.vat.selectedVatId;
    input.disabled = !viewModel.pachinko.vat.canSelect;
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
  render(spikeController.dropSelectedIngredient());
});

grabButton.addEventListener('click', () => {
  lastFrameTime = performance.now();
  render(spikeController.grabWithClaw());
});

submitButton.addEventListener('click', () => {
  lastFrameTime = performance.now();
  render(spikeController.submitGrabbedBatchToVat());
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

for (const input of ingredientInputs) {
  input.addEventListener('change', () => {
    if (!input.checked || !isSpikeQueuedIngredientKind(input.value)) {
      return;
    }

    lastFrameTime = performance.now();
    render(spikeController.selectIngredient(input.value));
  });
}

for (const input of clawPositionInputs) {
  input.addEventListener('change', () => {
    if (!input.checked || !isSpikeClawPositionId(input.value)) {
      return;
    }

    lastFrameTime = performance.now();
    render(
      spikeController.selectClawPosition(input.value as ViewClawPositionId),
    );
  });
}

for (const input of vatInputs) {
  input.addEventListener('change', () => {
    if (!input.checked || !isSpikeDebugVatId(input.value)) {
      return;
    }

    lastFrameTime = performance.now();
    render(spikeController.selectVat(input.value as ViewDebugVatId));
  });
}

render();
requestAnimationFrame(tick);
