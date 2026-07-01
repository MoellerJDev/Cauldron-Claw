import type { RunState, RoundScoreDelta } from '../run-state/types';
import type { DomainEvent } from '../events/DomainEvent';

export type VatId = 'healing' | 'poison' | 'bone' | 'trash';

export interface VatDefinition {
  id: VatId;
  label: string;
  description: string;
}

export interface VatScoreResult {
  vatId: VatId;
  gold: number;
  suspicionDelta: number;
  contractProgress: RoundScoreDelta;
  logEntries: readonly string[];
}

export interface VatSubmissionResult {
  state: RunState;
  result: VatScoreResult;
  events: readonly DomainEvent[];
}

