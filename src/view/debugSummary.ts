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
    `Selected ingredient: ${model.pachinko.selectedIngredientLabel ?? 'none'}`,
    `Remaining ingredients: ${formatRemainingIngredients(model)}`,
    `Drops remaining: ${model.pachinko.dropsRemaining} / ${model.pachinko.maxDrops}`,
    model.pachinko.setupPhase === 'ready-for-claw'
      ? 'Drop phase complete.'
      : 'Drop phase active.',
    `Active ingredients: ${ingredients.length}`,
    `Cauldron contents: ${enteredContents.length}`,
    `Healing materials: ${model.pachinko.materialPreview.healing}`,
    `Bone materials: ${model.pachinko.materialPreview.bone}`,
    `Poison materials: ${model.pachinko.materialPreview.poison}`,
    `Claw position: ${model.pachinko.claw.selectedPositionId}`,
    `Grab used: ${model.pachinko.claw.grabUsed ? 'yes' : 'no'}`,
    `Grabbed contents: ${model.pachinko.claw.grabbedContents.length}`,
    `Grabbed healing materials: ${model.pachinko.claw.grabbedMaterialPreview.healing}`,
    `Grabbed bone materials: ${model.pachinko.claw.grabbedMaterialPreview.bone}`,
    `Grabbed poison materials: ${model.pachinko.claw.grabbedMaterialPreview.poison}`,
    `Selected vat: ${model.pachinko.vat.selectedVatLabel}`,
    `Submitted: ${model.pachinko.vat.submitted ? 'yes' : 'no'}`,
    ...formatVatScoringResult(model.pachinko.vat.lastScoringResult),
    `Last physics event: ${model.pachinko.lastPhysicsEvent ?? 'none'}`,
    `Last domain/reaction event: ${
      model.pachinko.lastDomainEvent ?? 'none'
    }`,
    ...formatGrabbedContents(model.pachinko.claw.grabbedContents),
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

function formatRemainingIngredients(model: GameViewModel): string {
  const remaining = model.pachinko.ingredientQueue
    .filter((entry) => !entry.dropped)
    .map((entry) => entry.label);

  return remaining.length === 0 ? 'none' : remaining.join(', ');
}

function formatVatScoringResult(
  result: GameViewModel['pachinko']['vat']['lastScoringResult'],
): readonly string[] {
  if (result === undefined) {
    return [
      'Scoring result: none',
      'Submitted ingredients: none',
      'Total batch gold: 0',
      'Suspicion delta: 0',
    ];
  }

  return [
    `Scoring result: ${result.vatLabel}`,
    `Submitted ingredients: ${formatSubmittedIngredients(result)}`,
    `Total batch gold: ${result.gold}`,
    `Suspicion delta: ${result.suspicionDelta}`,
  ];
}

function formatSubmittedIngredients(
  result: NonNullable<
    GameViewModel['pachinko']['vat']['lastScoringResult']
  >,
): string {
  if (result.submittedIngredients.length === 0) {
    return 'none';
  }

  return result.submittedIngredients
    .map((ingredient) => ingredient.label)
    .join(', ');
}

function formatGrabbedContents(
  contents: GameViewModel['pachinko']['claw']['grabbedContents'],
): readonly string[] {
  if (contents.length === 0) {
    return ['- Claw has not grabbed anything.'];
  }

  return contents.map(
    (entry) =>
      `- Grabbed ${entry.ingredientId}: ${entry.label} (${entry.kind})`,
  );
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
