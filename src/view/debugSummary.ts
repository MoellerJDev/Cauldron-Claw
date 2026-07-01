import type { GameViewModel } from './GameViewModel';

export function formatGameDebugSummary(model: GameViewModel): string {
  const state = model.runState;
  const contract = state.round.activeContract;
  const ingredients = model.pachinko.ingredients;
  const enteredContents = model.pachinko.cauldronContents.filter(
    (entry) => entry.enteredCauldron,
  );

  return [
    `Round: ${state.roundNumber}/${state.maxRounds}`,
    `Phase: ${state.round.phase}`,
    `Contract: ${contract.label}`,
    `Spike setup phase: ${model.pachinko.setupPhase}`,
    `Selected lane: ${model.pachinko.selectedLaneId}`,
    `Drops remaining: ${model.pachinko.dropsRemaining} / ${model.pachinko.maxDrops}`,
    model.pachinko.setupPhase === 'ready-for-claw'
      ? 'Drop phase complete.'
      : 'Drop phase active.',
    `Active ingredients: ${ingredients.length}`,
    `Cauldron contents: ${enteredContents.length}`,
    `Last physics event: ${model.pachinko.lastPhysicsEvent ?? 'none'}`,
    `Last domain/reaction event: ${
      model.pachinko.lastDomainEvent ?? 'none'
    }`,
    ...formatCauldronContents(enteredContents),
    `Gold: ${state.gold}`,
    `Debt: ${state.debt}`,
    `Suspicion: ${state.suspicion}`,
    `Round gold: ${state.round.score.goldEarned}`,
    `Placeholder round drops: ${state.round.remainingDrops}`,
    `Placeholder claw grabs: ${state.round.remainingClawGrabs}`,
    '',
    'Event log:',
    ...model.pachinko.eventLog.map((entry) => `- ${entry}`),
  ].join('\n');
}

function formatCauldronContents(
  contents: GameViewModel['pachinko']['cauldronContents'],
): readonly string[] {
  if (contents.length === 0) {
    return ['- Cauldron is empty.'];
  }

  return contents.map(
    (entry) =>
      `- ${entry.ingredientId}: ${entry.label} (${entry.kind}), entered=${entry.enteredCauldron}`,
  );
}
