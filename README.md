# Cauldron Claw

Cauldron Claw is a browser-first TypeScript prototype for a pachinko-claw alchemy roguelike. Players will eventually drop ingredients through a pachinko board, build a physical cauldron pile, then use a claw to extract ingredients into vats and fulfill cursed contracts.

## Stack

- TypeScript
- Vite
- PixiJS
- Matter.js
- Vitest
- ESLint
- Prettier

## Local Setup

```sh
npm install
npm run dev
```

## Current MVP Scope

This repository currently contains the project foundation plus a small pachinko visual spike:

- Pure domain modules under `src/core`
- Physics-facing interfaces under `src/sim`
- Matter.js adapter placeholder under `src/sim/matter`
- Rendering-facing interfaces under `src/view`
- PixiJS placeholder view under `src/view/pixi`
- App orchestration/debug boot code under `src/app`
- Initial data definitions under `src/data`
- Herb, Bone, and Mushroom balls falling through physical pegs, with Fire Peg contact transforming Herb into Ash through pure core logic
- Debug HTML controls for lane selection, ingredient selection, 3 total drops, claw position selection, one debug grab, debug vat selection, batch submission, and spike reset

The current browser app renders debug primitives only: three drop lanes, a three-ingredient setup queue, neutral static pegs, one discrete Fire Peg, a cauldron catch sensor, a cauldron catch area, a simple three-position debug claw, and three debug vats. The Drop Selected Ingredient button drops Herb, Bone, or Mushroom once each from the selected lane until the 3-drop setup limit is reached, then the spike moves to `ready-for-claw`. Neutral pegs physically redirect ingredients without transforming them; Fire Peg contact transforms Herb into Ash. In `ready-for-claw`, the player can select left, center, or right claw position and use one debug Grab to extract cauldron ingredients inside the selected grab rectangle. Grabbed ingredients are removed from the physics world and shown in the debug panel with grabbed material preview counts. After a non-empty grab, the player can select Healing, Bone, or Poison Vat and submit the batch once through the core vat scoring path, updating run gold, suspicion, round score, and the event log. Reset Spike clears the cauldron and restores the default drop phase, ingredient queue, claw state, vat state, and scoring result. Full gameplay, contract resolution, upgrade draft, art, audio, save/load, map routing, and desktop packaging are intentionally deferred.

## Commands

```sh
npm run dev
npm run typecheck
npm run lint
npm run test
npm run build
npm run format
```
