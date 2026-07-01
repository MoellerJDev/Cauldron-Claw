# AGENTS.md — Cauldron Claw

This document is the project initializer, design standard, and implementation guide for Codex or any coding agent working on this repository.

Treat this file as the source of truth unless the human explicitly overrides it. When the design changes, update this document before making broad implementation changes.

---

## 1. Working title

**Cauldron Claw**

Working tagline:

> A pachinko-claw alchemy roguelike where you drop ingredients to build a physical cauldron pile, then claw out combos to fulfill cursed contracts.

The name is short, readable, and captures the most important unique mechanic: the cauldron is not just flavor; it is the physical space the player manipulates with a claw.

Possible later alternatives, if the tone changes:

- **Cursed Cauldron Co.** — stronger if the game leans into debt, shopkeeping, and shady contracts.
- **Claw & Cauldron** — more fantasy/cozy, less arcade.
- **The Grasping Cauldron** — stranger and more flavorful, but less immediately readable.
- **Cauldron Drop** — better if the pachinko phase becomes more important than the claw phase.
- **Potion Drop** — simple, but less distinctive.

Until changed by the human, use **Cauldron Claw** in code comments, docs, project files, and UI placeholders.

---

## 2. Project summary

Build a browser-first, TypeScript-based prototype for **Cauldron Claw**, a physics-driven roguelike built around a two-phase physical loop:

1. **Pachinko setup:** the player drops ingredient balls through a board of pegs, hazards, and reaction zones. Ingredients transform and land in a cauldron.
2. **Claw extraction:** the player uses a claw to grab ingredients from the resulting physical pile and drop them into vats to score contracts.

The goal is not to clone Peglin, Luck Be a Landlord, Dungeon Clawler, Rune Dice, CloverPit, RACCOIN, or Fortune Mill.

The goal is to combine their strongest overlapping qualities:

- Physical randomness the player can learn to exploit.
- Simple repeated actions that become strategically rich through upgrades.
- Symbol/ingredient valuation that changes based on the current build.
- Short rounds, draft rewards, escalating pressure, and emergent combos.
- Multiple interacting subsystems without building a giant simulation game.

The core fantasy:

> You are a desperate alchemist using a questionable magical machine to fulfill increasingly cursed contracts. You drop unstable ingredients into the machine, shape where they land, and claw out whatever profitable mess you can salvage.

---

## 3. Product pillars

Every feature should support at least one of these pillars.

### 3.1 Controlled chaos

The player should feel that physics creates messy opportunities, not meaningless randomness.

Good outcomes:

- The player aimed well and got rewarded.
- The player made a risky drop and adapted to the result.
- The player accidentally created a cursed combo, then exploited it.
- The player can explain why something happened.

Bad outcomes:

- The player cannot understand why they won or lost.
- The physics feels like pure noise.
- The optimal play is obvious every round.
- The game becomes a spreadsheet with decorative bouncing.

### 3.2 Two-step strategy

The player first creates the pile, then extracts from it.

The pachinko phase should answer:

> What ingredients exist, what state are they in, and where do they land?

The claw phase should answer:

> What can I salvage from this pile, and where should I convert it?

Neither phase should be allowed to become a full separate game during the MVP.

### 3.3 Build revaluation

The same ingredient should change value based on upgrades, contracts, and risk.

Examples:

- Curse is bad at first, but profitable with Poison upgrades.
- Ash is waste at first, then becomes a Bone Vat combo piece.
- Gold is always valuable, but heavy and hard to position.
- Slime is annoying until the player has clump-based upgrades.

This is the Luck Be a Landlord / Rune Dice style hook: the player’s build changes what they want.

### 3.4 Scope discipline

The MVP should prove the core loop, not simulate an entire alchemy shop.

Prefer one deep interaction over five shallow systems.

When considering a feature, ask:

> Does this improve the drop, the pile, the grab, the vat payout, the contract pressure, or the upgrade decision?

If not, cut it or defer it.

---

## 4. Target stack

Use a code-first web stack, not a traditional game engine.

Recommended stack:

- **TypeScript** for all game logic.
- **Vite** for dev server and build.
- **PixiJS** for rendering.
- **Matter.js** for the first 2D physics implementation.
- **Vitest** for unit tests.
- **Playwright** for browser smoke tests later.
- **ESLint** and **Prettier** for code quality.
- Browser-first prototype.
- Tauri only later, after the game is fun.

Do not add React, Redux, Zustand, ECS frameworks, dependency injection frameworks, or large state libraries unless the human explicitly approves it or the need is demonstrated by implementation pain.

The project should be developed like a browser game but structured so it can later be packaged as a desktop game.

---

## 5. Core technical principle

The game rules must not depend directly on PixiJS, Matter.js, DOM APIs, or browser event objects.

PixiJS and Matter.js are implementation details behind interfaces.

The domain/core game logic should be pure TypeScript and easy to test without a browser, canvas, renderer, or physics engine.

Good architecture:

```txt
src/core/
  contracts/
  ingredients/
  reactions/
  rng/
  run-state/
  scoring/
  upgrades/
  vats/

src/sim/
  PhysicsEvent.ts
  PhysicsWorld.ts
  SimObject.ts

src/sim/matter/
  MatterPhysicsWorld.ts
  MatterObjectMap.ts

src/view/
  GameView.ts
  PixiGameView.ts
  ui/

src/app/
  EncounterController.ts
  GameLoop.ts
  PhaseController.ts

src/data/
  ingredients.ts
  contracts.ts
  upgrades.ts
  vats.ts
```

Avoid architecture where Matter bodies, Pixi sprites, DOM events, or UI controls directly mutate the run state.

Preferred event flow:

```txt
Matter collision callback
  -> emits PhysicsEvent
  -> EncounterController maps it to a domain event
  -> core reducer/system updates RunState
  -> view renders updated state
```

Do not put business rules inside collision callbacks.

Do not put scoring logic inside rendering code.

Do not put player progression logic inside physics objects.

---

## 6. MVP scope

The first prototype should be intentionally small.

The MVP is one screen with:

- One pachinko board.
- One cauldron area.
- One claw.
- Four vats.
- Eight ingredients.
- Around twelve to twenty upgrades.
- Around ten to twelve contracts.
- One debt meter.
- Optional simple suspicion meter.
- A run length of roughly ten rounds.

Do not add the following in the MVP:

- Map routing.
- Traditional combat.
- Enemies with health bars.
- Bosses.
- Character classes.
- Equipment slots.
- Large crafting trees.
- Persistent contamination visuals.
- Multiple machines.
- Multiple boards.
- A shopkeeping simulation.
- Complex save/load.
- Polished art.
- Audio.
- Steam integration.
- Tauri packaging.

The prototype is successful if one round makes the player want to draft an upgrade and try one more round.

---

## 7. Core gameplay loop

Each round follows this structure:

```txt
1. Contract appears.
2. Player receives a small hand/pool of ingredient balls.
3. Player chooses ingredients and drop lanes for the pachinko phase.
4. Ingredients fall through pegs, hazards, and reaction zones.
5. Transformed ingredients land in the cauldron as physical objects.
6. Player gets a small number of claw grabs.
7. For each grab:
   - player positions the claw
   - claw descends
   - claw grabs ingredients from the cauldron pile
   - player chooses a vat
   - claw drops grabbed ingredients into that vat
   - vat scoring and reactions resolve
8. Contract resolves.
9. Debt and optional suspicion update.
10. Player drafts 1 upgrade from 3 options.
11. Next round begins.
```

The primary player decisions are:

1. Which ingredients do I drop?
2. Which lane do I drop them into?
3. How do I use the resulting cauldron pile?
4. Where do I aim the claw?
5. Which vat should receive the grab?
6. Which upgrade changes my future valuation the most?

Everything in the MVP should support those decisions.

---

## 8. Round phases

Represent round flow explicitly. Do not infer phase from scattered booleans.

Suggested phase model:

```ts
type RoundPhase =
  | 'contract-preview'
  | 'drop-select'
  | 'pachinko-resolving'
  | 'claw-aim'
  | 'claw-descending'
  | 'claw-holding'
  | 'vat-select'
  | 'vat-resolving'
  | 'contract-resolving'
  | 'upgrade-draft'
  | 'round-complete';
```

State transitions should be handled in a small number of controller/reducer functions and covered by tests where practical.

---

## 9. MVP mechanics

### 9.1 Drop phase

The player should have limited but meaningful control.

For MVP:

- Give the player a hand of 4 or 5 ingredient balls.
- Let them choose 3 to drop.
- Let them choose from a small number of lanes, such as 5 lanes.
- Resolve one ingredient at a time.
- Use simple, readable peg reactions.

Do not implement player-placed pegs in the first MVP unless the human explicitly requests it.

### 9.2 Pachinko board

The board is the setup tool. It should change ingredients and influence where they land.

Starting peg/zone concepts:

- **Fire Peg:** burns organic ingredients into Ash.
- **Water Peg:** cleans or hydrates ingredients.
- **Rot Peg:** mutates organic ingredients into Poison/Rot variants.
- **Split Peg:** duplicates small/light ingredients.
- **Bumper Peg:** affects trajectory without changing ingredient state.

Keep the board readable. Avoid too many peg types at once.

### 9.3 Cauldron pile

The cauldron is the shared physical state between the drop phase and the claw phase.

Location matters.

Good player thoughts:

- I want this ingredient to land near the left side because my claw can reach it easily.
- I need these two ingredients to land close together so one grab can extract both.
- The gold is valuable but likely to sink under lighter ingredients.
- I accidentally buried the Curse, which might be good because I can avoid grabbing it.

For MVP, the cauldron may reset each round.

Do not implement full persistent contamination yet. Use simple carryover tokens later if needed.

### 9.4 Claw phase

The claw is the payoff tool.

For MVP:

- Player can move the claw horizontally.
- Player chooses when to drop the claw.
- Claw grabs physical objects within its shape/area.
- Claw has simple strength/capacity limits.
- Player gets 2 or 3 grabs per round.
- After each grab, player chooses a vat.

Do not overbuild realistic claw mechanics. Fun and readability beat simulation accuracy.

### 9.5 Vats

Vats convert grabbed ingredients into scoring, money, risk, or utility.

Starting vats:

#### Healing Vat

Safe, reliable payout.

Suggested rules:

- Herb scores here.
- Water boosts clean ingredients.
- Curse reduces payout or adds risk.

#### Poison Vat

Higher-risk payout.

Suggested rules:

- Mushroom and Rot score well here.
- Curse can become valuable through upgrades.
- Poison payouts may increase Suspicion.

#### Bone Vat

Combo/scaling payout.

Suggested rules:

- Bone and Ash score here.
- Multiple Bone/Ash ingredients in one grab should matter.
- Strong upgrades can make this vat a build-around.

#### Trash Vat

Safety and cleanup.

Suggested rules:

- Clears bad ingredients.
- Low or no payout.
- May reduce Suspicion or give small utility through upgrades.

### 9.6 Contracts

Contracts are the pressure system and the replacement for traditional combat.

Contracts should be simple scoring challenges:

- Earn at least X gold this round.
- Earn X gold from a specific vat.
- Score at least N of an ingredient family.
- Avoid scoring a forbidden ingredient.
- Use no more than N suspicion.
- Trash at least N cursed ingredients.

Contracts should be visible before the drop phase so the player can plan.

### 9.7 Debt

Debt is the main pressure system.

Use simple rules:

- Each round has a required payment or contract target.
- Meeting the contract lets the player continue and keep surplus value.
- Missing the contract increases debt, reduces health, or consumes a limited fail resource.

Do not introduce multiple failure systems early.

### 9.8 Suspicion

Suspicion is optional in the earliest implementation but likely valuable.

Use it as a simple risk meter for illegal/unsafe alchemy.

Suggested behavior:

- Poison, Bone, Curse, or illegal outputs may add Suspicion.
- At thresholds, add minor complications.
- Do not turn Suspicion into a full law-enforcement simulation.

Example thresholds:

- 3 Suspicion: add one Inspector Token next round.
- 6 Suspicion: Poison Vat pays less until suspicion is reduced.
- 9 Suspicion: major penalty or run loss.

---

## 10. Starting ingredient set

Start with around eight ingredients.

Suggested MVP ingredients:

### Herb

Safe, light, clean.

- Good in Healing Vat.
- Can burn into Ash.
- Can rot into Mushroom/Rot depending on rules.

### Water

Cleanser/modifier.

- Boosts Herb in Healing Vat.
- May extinguish Fire effects.
- Low value alone.

### Mushroom

Risk/reward organic ingredient.

- Good in Poison Vat.
- May duplicate or mutate through upgrades.

### Bone

Heavy-ish combo piece.

- Good in Bone Vat.
- Pairs with Ash.

### Ash

Transformation product.

- Created when organic ingredients burn.
- Scores in Bone Vat or Poison Vat depending on upgrades.

### Gold Nugget

High-value physical object.

- Heavy.
- Scores in most vats or special contracts.
- Hard to position and grab.

### Slime

Clumping/control ingredient.

- Sticky.
- Can help or hurt claw grabs.
- Useful for upgrades around clusters.

### Curse

Bad by default, build-around later.

- Reduces safe payouts.
- Adds Suspicion or penalties.
- Can become valuable through Poison/Bone upgrades.

Each ingredient should have both:

1. A rules identity.
2. A physical identity.

---

## 11. Upgrade design

Every upgrade should modify one of these areas:

1. Drop phase.
2. Pachinko board.
3. Cauldron pile.
4. Claw behavior.
5. Vat scoring.
6. Contract/economy pressure.

Avoid upgrades that add brand-new subsystems.

### 11.1 Drop upgrades

Examples:

- First ingredient dropped each round gains +1 value.
- Choose one extra ingredient in the drop phase.
- Heavy ingredients bounce less.
- Organic ingredients split the first time they hit Water.
- Dropped ingredients of the same family attract each other slightly.

### 11.2 Board upgrades

Examples:

- Add one Fire Peg.
- Fire Pegs create Ash worth +1.
- Split Pegs also reduce ingredient size.
- Water Pegs clean Curse once per round.
- Bottom pegs nudge ingredients toward the center.

### 11.3 Cauldron upgrades

Examples:

- Ingredients landing near each other clump slightly.
- Gold sinks less.
- Slime sticks to one extra nearby ingredient.
- Curse repels clean ingredients.
- The cauldron gently stirs between drops.

### 11.4 Claw upgrades

Examples:

- Wider Claw.
- Stronger Claw.
- Magnet Claw.
- Sticky Claw.
- Claw holds one extra ingredient.
- First grab each round ignores Curse.

### 11.5 Vat upgrades

Examples:

- Bone Vat treats Ash as Bone.
- Healing Vat pays +2 if no Curse is included.
- Poison Vat pays double for Curse but adds Suspicion.
- Trash Vat reduces Suspicion when trashing Curse.
- Gold scored in any vat gives +1 reroll.

### 11.6 Economy upgrades

Examples:

- First failed contract each run costs less.
- Gain +1 gold after each successful contract.
- Rerolls cost less.
- Reduce debt target every third round.

---

## 12. Design constraints

Follow these constraints unless the human explicitly changes them.

### 12.1 One-screen MVP

The player should not need to navigate multiple screens during the main round.

The main screen should show:

- Contract.
- Pachinko board.
- Cauldron.
- Claw.
- Vats.
- Debt/suspicion.
- Current phase instructions.

Upgrade draft may be an overlay.

### 12.2 Limited content first

Prefer fewer, more legible pieces.

Do not add new ingredient types just because it is easy. Each ingredient must create a distinct physical and strategic behavior.

### 12.3 No traditional combat in MVP

Contracts are combat.

Do not add enemy HP, attack turns, player HP, skills, or damage formulas unless the human explicitly changes the direction.

### 12.4 No full shop sim in MVP

Draft rewards are the shop.

Do not add customers walking in, inventory management, prices, shelves, or day/night shopkeeping simulation.

### 12.5 No persistent physical mess in MVP

The idea of residue/contamination is good, but defer it.

Use simple carryover effects first:

- Add 2 Rot ingredients next round.
- Start next round with 1 Curse in the cauldron.
- Add 1 Inspector Token next round.

---

## 13. Testing strategy

The project should be built with test-driven development where practical.

Do not try to unit test exact physics trajectories. Physics is allowed to be approximate, visual, and integration-tested.

Do unit test:

- Ingredient transformations.
- Vat scoring.
- Contract resolution.
- Debt/suspicion updates.
- Upgrade effects.
- Round phase transitions.
- Seeded RNG behavior.
- Mapping from physics events to domain events where possible.

Use Vitest for fast core tests.

Suggested test structure:

```txt
src/core/reactions/reactionSystem.test.ts
src/core/vats/vatScoring.test.ts
src/core/contracts/contractResolution.test.ts
src/core/upgrades/upgradeEffects.test.ts
src/core/run-state/roundReducer.test.ts
src/app/phaseController.test.ts
```

Use Playwright later for smoke tests:

- App loads.
- Start run.
- Drop ingredient.
- Resolve phase.
- Perform claw grab.
- Score vat.
- Reach upgrade draft.

### 13.1 Test quality standards

Tests should be deterministic.

Use seeded RNG for any randomized game logic.

Avoid brittle tests against exact floating-point physics positions.

Prefer testing meaningful outcomes:

- A Fire Peg event transforms Herb into Ash.
- A vat receives Ash and Bone and scores correctly.
- A failed contract increases debt.
- An upgrade changes scoring as described.

---

## 14. Code standards

### 14.1 General

- Use TypeScript strict mode.
- Prefer small modules with clear ownership.
- Prefer pure functions in `src/core`.
- Keep rendering, simulation, and domain logic separate.
- Use explicit domain types instead of strings where practical.
- Avoid global mutable state.
- Avoid large files that mix unrelated concerns.

### 14.2 Naming

Use domain language consistently:

- `Ingredient`
- `IngredientKind`
- `Peg`
- `Vat`
- `Contract`
- `Upgrade`
- `RunState`
- `RoundState`
- `PhysicsEvent`
- `DomainEvent`

Avoid vague names like `Thing`, `Stuff`, `ObjectData`, `GameObject`, or `Manager` unless there is no clearer alternative.

### 14.3 State updates

Core state transitions should be explicit and testable.

Prefer reducers/systems like:

```ts
applyDomainEvent(state, event)
scoreVatGrab(state, vatId, ingredientIds)
resolveContract(state, contractId)
applyUpgrade(state, upgradeId)
```

Do not mutate state from inside rendering code.

### 14.4 Error handling

Fail loudly during development.

Invalid phase transitions, missing ingredient IDs, impossible scoring states, and unknown upgrade IDs should throw clear errors in development/test code.

---

## 15. Data standards

Content definitions should live in data modules, not scattered throughout logic.

Example:

```ts
export const INGREDIENT_DEFS: Record<IngredientKind, IngredientDefinition> = {
  herb: { label: 'Herb', family: 'clean', baseValue: 2, physical: { weight: 'light' } },
  // ...
};
```

Data should be simple enough for Codex to modify safely.

Do not prematurely create a complex content pipeline or external editor.

---

## 16. Randomness and determinism

All game randomness should flow through a project-owned RNG abstraction.

Do not call `Math.random()` directly in core game logic.

Use seeded randomness for:

- Contract selection.
- Ingredient hand generation.
- Upgrade draft options.
- Board variation if added.

This is important for testing, debugging, and reproducing interesting runs.

---

## 17. UI and UX standards

The player should always understand:

- Current round.
- Current contract.
- Current phase.
- Remaining drops.
- Remaining claw grabs.
- Current money/debt.
- Current suspicion, if implemented.
- What each vat does.
- What just scored or transformed.

Use temporary debug UI freely during MVP.

Prioritize readable labels over polish.

Show a small event log early. It is extremely useful for debugging and player comprehension.

Example log entries:

- `Herb hit Fire Peg and became Ash.`
- `Claw grabbed Ash, Bone, and Curse.`
- `Bone Vat scored 9 gold.`
- `Suspicion increased by 1.`
- `Contract complete.`

---

## 18. Graphics and rendering standards

PixiJS is the renderer for the physical machine and playfield: ingredients, pegs, reaction zones, cauldron boundaries, claw geometry, and vat zones.

Plain HTML/CSS remains acceptable for early UI panels, including contracts, debug logs, score summaries, phase prompts, and upgrade choices. Use the simplest surface that keeps the prototype readable.

The MVP should use procedural, debug-readable graphics rather than art assets.

Do not add sprite sheets, texture atlas tooling, animation frameworks, skeletal animation, asset managers, or audio pipelines in the MVP.

Initial rendering standards:

- Ingredients render as simple labeled circles.
- Pegs render as simple static circles.
- Reaction pegs and reaction zones must be visually distinct and debug-readable.
- The cauldron is represented with simple geometry and boundaries.
- The claw is represented with simple geometry.
- Vats render as labeled boxes or zones.

Rendering must consume presentation/view models or app-level state. Rendering code must not mutate core game rules.

PixiJS display objects must not be stored in core domain entities.

Matter.js bodies must not be stored in core domain entities.

Matter body IDs and Pixi render object IDs may be linked only inside adapter or app-level mapping code.

Debug rendering is encouraged during the MVP. Labels, body outlines, reaction logs, active zones, drop lanes, and selected objects are more important than polish.

---

## 19. Physics standards

Physics should support gameplay, not realism.

Do not chase exact simulation realism.

Prioritize:

- Stable interaction.
- Readable outcomes.
- Satisfying motion.
- Good-enough collision behavior.
- Few surprising edge cases.

Avoid relying on exact physics paths for game-critical rules.

Game-critical rules should trigger from clear events:

- Ingredient hit peg.
- Ingredient entered cauldron.
- Ingredient grabbed by claw.
- Ingredient released into vat.

---

## 20. Initial implementation milestones

### Milestone 1 — Project skeleton

Create the Vite TypeScript project with:

- Build script.
- Test script.
- Typecheck script.
- Lint/format setup.
- Basic Pixi canvas boot.
- Basic Vitest test.

Definition of done:

- `npm run build` passes.
- `npm run test` passes.
- `npm run typecheck` passes.
- App shows an empty placeholder game view.

### Milestone 2 — Core domain model

Implement pure TypeScript definitions for:

- Ingredients.
- Vats.
- Contracts.
- Upgrades.
- RunState/RoundState.
- Seeded RNG.

Definition of done:

- Core tests cover contract resolution, scoring, and upgrade application.
- No PixiJS or Matter.js imports inside `src/core`.

### Milestone 3 — Pachinko setup spike

Implement a simple board:

- 5 drop lanes.
- A few static pegs.
- Ingredient balls fall into cauldron.
- At least one peg transforms an ingredient.

Definition of done:

- Player can drop an ingredient.
- Ingredient lands in cauldron.
- Fire Peg can transform Herb into Ash.
- Transformation appears in event log.

### Milestone 4 — Claw extraction spike

Implement the claw:

- Move horizontally.
- Descend into cauldron.
- Grab nearby ingredients.
- Lift and drop into selected vat.

Definition of done:

- Player can grab physical ingredients from cauldron.
- Player can choose a vat.
- Vat scoring updates run state.
- Event log shows grabbed/scored ingredients.

### Milestone 5 — Complete one round

Implement one full loop:

- Contract preview.
- Drop phase.
- Claw phase.
- Vat scoring.
- Contract resolution.
- Upgrade draft.
- Next round.

Definition of done:

- One round can be completed without dev intervention.
- A selected upgrade affects the next round.
- Tests cover the phase transitions.

### Milestone 6 — First playable prototype

Expand content to:

- 8 ingredients.
- 4 vats.
- 10 to 12 contracts.
- 12 to 20 upgrades.
- 10-round run structure.

Definition of done:

- The game can be played from start to run end.
- There is enough variation to evaluate whether the loop is fun.
- Known rough edges are documented.

---

## 21. Codex working rules

When implementing changes:

1. Read this document first.
2. Keep changes small and focused.
3. Prefer adding or updating tests with behavior changes.
4. Do not introduce new dependencies without a clear reason.
5. Do not collapse architecture boundaries for convenience.
6. Do not implement deferred features unless explicitly asked.
7. Run relevant tests before declaring completion.
8. Report what changed, what was tested, and what remains uncertain.

When asked to implement a feature, Codex should usually:

1. Identify which layer owns the behavior.
2. Add or update data definitions if needed.
3. Add core tests for rules/scoring/state changes.
4. Implement core behavior.
5. Wire physics/view/controller only after core behavior exists.
6. Add debug UI/logging if useful.

---

## 22. Dependency policy

Be conservative with dependencies.

Allowed initial dependencies:

- TypeScript
- Vite
- PixiJS
- Matter.js
- Vitest
- Playwright later
- ESLint
- Prettier

Do not add:

- React
- Redux
- Zustand
- MobX
- Phaser
- Rapier
- Tauri
- Electron
- Tailwind
- Styled-components
- ECS libraries
- Asset pipelines
- Audio libraries

unless the human approves or the project has reached a point where the need is clear.

---

## 23. Deferred ideas

These ideas are promising but should not be implemented in the MVP.

- Persistent residue/contamination on the board.
- Multiple cauldrons.
- Player-built peg boards.
- Boss contracts.
- Customer personalities.
- Shop simulation.
- Character classes.
- Starting relics.
- Full campaign map.
- Steam/Tauri packaging.
- Controller support.
- Polished art/audio.
- Daily seeded runs.
- Leaderboards.

Keep them in mind, but do not build them early.

---

## 24. Prototype success criteria

The first playable version is promising if:

- The player can form a plan during the drop phase.
- The cauldron pile makes the claw phase meaningfully different every round.
- The player sometimes adapts to unexpected physics outcomes.
- Upgrades change what the player values.
- Failed grabs feel funny or understandable, not arbitrary.
- The player wants to try one more round after drafting an upgrade.

The prototype is not promising yet if:

- The pachinko phase feels disconnected from the claw phase.
- The claw phase feels like pure luck.
- Contracts are solved the same way every round.
- Ingredients lack distinct physical identities.
- Upgrades are mostly numeric bonuses.
- The player cannot tell what happened.

---

## 25. Current source of truth summary

Use this summary when orienting a new coding session:

**Cauldron Claw** is a browser-first TypeScript physics roguelike. Each round, the player sees a contract, drops ingredient balls through a pachinko board, uses the resulting cauldron pile to make claw-machine grabs, drops grabbed ingredients into vats, scores the contract, then drafts an upgrade. The MVP should be one screen, test-heavy, and architected with pure core game logic separated from PixiJS rendering and Matter.js physics.
