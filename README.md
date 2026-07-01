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
- Herb balls falling through physical pegs, with Fire Peg contact transforming Herb into Ash through pure core logic
- Debug HTML controls for lane selection, 3 Herb drops, and spike reset

The current browser app renders debug primitives only: three drop lanes, Herb balls, neutral static pegs, one discrete Fire Peg, a cauldron catch sensor, and a cauldron catch area. The Drop Herb button adds one Herb from the selected lane until the 3-drop setup limit is reached, then the spike moves to `ready-for-claw`. Neutral pegs physically redirect ingredients without transforming them; Fire Peg contact transforms Herb into Ash. Reset Spike clears the cauldron and restores the default drop phase. The debug panel shows setup phase, selected lane, drops remaining, active ingredients, cauldron contents, and the latest physics/domain diagnostics. Full gameplay, claw behavior, vat selection, upgrade draft, art, audio, save/load, map routing, and desktop packaging are intentionally deferred.

## Commands

```sh
npm run dev
npm run typecheck
npm run lint
npm run test
npm run build
npm run format
```
