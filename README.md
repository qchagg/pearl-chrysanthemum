# Skirmish Road

A browser-based tactics roguelike: grid-based Fire Emblem–style battles, connected by a branching, choice-based world map. Permadeath within a run, persistent meta-progression between runs.

## Play

```bash
npm install
npm run dev
```

Open the printed local URL. `npm run build` produces a static production bundle in `dist/`; `npm run preview` serves it locally.

## The loop

- **Begin New Run** from the main menu to start a fresh company of three units (Vanguard, Lancer, Cleric) with starting gold.
- Navigate a branching path of nodes across 3 acts — Skirmish, Elite, Recruit, Shop, Rest, Event, and a Boss at the top of each act. You choose which connected node to enter next; the path forks and reconverges like a roguelike deck-builder's map.
- **Battles** are turn-based on an 8×6 grid with terrain (forest, mountain, fort). Select a unit, move within its range, then attack an enemy in weapon range, heal an ally (Cleric), or wait. Hit chance, critical hits, the sword/axe/lance weapon triangle, doubling, and counterattacks all follow classic tactics-RPG rules.
- **Units that die in battle are gone for the rest of the run.** There's no revive — only Rest nodes, potions, and careful play keep your company alive.
- Winning battles and clearing nodes earns gold (spend it at Shops) and Renown (a meta-currency banked at the end of every run, win or lose).
- Between runs, spend Renown in the **Armory** on permanent upgrades: more starting gold, roster capacity, unit power, and starting potions.

## Project structure

```
src/
  game/        Pure game logic and data: classes, units, enemies, terrain,
               combat resolution, movement/range math, enemy AI, the
               branching map generator, events, and meta-upgrade defs.
  store/       Zustand stores: metaStore (persisted cross-run progress),
               runStore (current run state + node navigation), battleStore
               (the live tactical battle state machine).
  components/  React screens: MainMenu, Armory, WorldMap, BattleScreen,
               RecruitNode, ShopNode, RestNode, EventNode, RunSummary.
```

Meta-progression (Renown and Armory upgrades) persists in `localStorage` across sessions. A run in progress does not currently persist across a page reload.

## Stack

Vite + React + TypeScript, Zustand for state, no backend — everything runs client-side.
