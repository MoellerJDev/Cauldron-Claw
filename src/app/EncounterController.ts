import type { Ingredient } from '../core/ingredients/types';
import type { RunState } from '../core/run-state/types';
import { submitGrabToVat } from '../core/scoring/vatScoring';
import type { VatId } from '../core/vats/types';

export class EncounterController {
  private state: RunState;

  constructor(initialState: RunState) {
    this.state = initialState;
  }

  getState(): RunState {
    return this.state;
  }

  submitGrab(vatId: VatId, ingredients: readonly Ingredient[]): RunState {
    const submission = submitGrabToVat(this.state, vatId, ingredients);
    this.state = submission.state;
    return this.state;
  }
}

