import { create } from 'zustand'
import { CLASSES, CLERIC_HEAL_AMOUNT } from '../game/classes'
import { generateBattleGrid } from '../game/battleMaps'
import { generateEnemies } from '../game/enemies'
import { computeAttackRange, computeMoveRange, key } from '../game/grid'
import { healUnit, resolveCombat } from '../game/combat'
import { planEnemyTurn } from '../game/ai'
import type { BattleGrid, Unit } from '../game/types'
import { useRunStore } from './runStore'

export type BattlePhase = 'player' | 'enemy' | 'victory' | 'defeat'
export type SubPhase = 'idle' | 'selecting-move' | 'selecting-action'

interface BattleState {
  grid: BattleGrid | null
  playerUnits: Unit[]
  enemyUnits: Unit[]
  phase: BattlePhase
  subPhase: SubPhase
  selectedId: string | null
  moveRange: Set<string>
  actionTargets: string[] // instanceIds attackable/healable from current tile
  log: string[]
  turn: number
  isElite: boolean
  isBoss: boolean

  startBattle: () => void
  selectUnit: (instanceId: string) => void
  deselect: () => void
  moveSelectedTo: (x: number, y: number) => void
  confirmAction: (targetId: string | null) => void
  usePotion: () => void
  runEnemyPhase: () => void
  endPlayerPhase: () => void
}

function pushLog(state: Pick<BattleState, 'log'>, lines: string[]): string[] {
  return [...state.log, ...lines].slice(-60)
}

function allUnitsOf(s: Pick<BattleState, 'playerUnits' | 'enemyUnits'>): Unit[] {
  return [...s.playerUnits, ...s.enemyUnits]
}

function checkOutcome(playerUnits: Unit[], enemyUnits: Unit[]): BattlePhase | null {
  const playersAlive = playerUnits.some((u) => !u.isDead)
  const enemiesAlive = enemyUnits.some((u) => !u.isDead)
  if (!playersAlive) return 'defeat'
  if (!enemiesAlive) return 'victory'
  return null
}

export const useBattleStore = create<BattleState>()((set, get) => ({
  grid: null,
  playerUnits: [],
  enemyUnits: [],
  phase: 'player',
  subPhase: 'idle',
  selectedId: null,
  moveRange: new Set(),
  actionTargets: [],
  log: [],
  turn: 1,
  isElite: false,
  isBoss: false,

  startBattle: () => {
    const run = useRunStore.getState()
    const node = run.map?.nodes.find((n) => n.id === run.currentNodeId)
    const difficulty = node?.type === 'boss' ? 'boss' : node?.type === 'elite' ? 'elite' : 'battle'
    const seed = Math.floor(Math.random() * 1e9)
    const grid = generateBattleGrid(seed, difficulty)

    const roster = run.roster.filter((u) => !u.isDead)
    const playerUnits = roster.map((u, i) => ({
      ...u,
      x: grid.playerSpawns[i % grid.playerSpawns.length].x,
      y: grid.playerSpawns[i % grid.playerSpawns.length].y,
      hasMoved: false,
      hasActed: false,
    }))

    const enemyTemplates = generateEnemies(run.act, difficulty)
    const enemyUnits = enemyTemplates.map((u, i) => ({
      ...u,
      x: grid.enemySpawns[i % grid.enemySpawns.length].x,
      y: grid.enemySpawns[i % grid.enemySpawns.length].y,
    }))

    set({
      grid,
      playerUnits,
      enemyUnits,
      phase: 'player',
      subPhase: 'idle',
      selectedId: null,
      moveRange: new Set(),
      actionTargets: [],
      log: [`Battle start: ${playerUnits.length} vs ${enemyUnits.length}.`],
      turn: 1,
      isElite: difficulty === 'elite',
      isBoss: difficulty === 'boss',
    })
  },

  selectUnit: (instanceId) => {
    const s = get()
    if (s.phase !== 'player') return
    const unit = s.playerUnits.find((u) => u.instanceId === instanceId)
    if (!unit || unit.hasActed || unit.isDead) return
    const range = computeMoveRange(unit, s.grid!, allUnitsOf(s))
    set({ selectedId: instanceId, subPhase: 'selecting-move', moveRange: range, actionTargets: [] })
  },

  deselect: () => {
    if (get().subPhase !== 'selecting-move') return
    set({ selectedId: null, subPhase: 'idle', moveRange: new Set(), actionTargets: [] })
  },

  moveSelectedTo: (x, y) => {
    const s = get()
    if (s.subPhase !== 'selecting-move' || !s.selectedId) return
    if (!s.moveRange.has(key({ x, y }))) return
    const unit = s.playerUnits.find((u) => u.instanceId === s.selectedId)!
    const grid = s.grid!
    const cls = CLASSES[unit.classId]

    const movedUnit = { ...unit, x, y, hasMoved: true }
    const playerUnits = s.playerUnits.map((u) => (u.instanceId === unit.instanceId ? movedUnit : u))

    const inRange = computeAttackRange({ x, y }, cls.range, grid)
    let targets: string[]
    if (cls.weapon === 'staff') {
      targets = playerUnits
        .filter((u) => !u.isDead && u.hp < u.stats.hp && inRange.has(key(u)))
        .map((u) => u.instanceId)
    } else {
      targets = s.enemyUnits.filter((u) => !u.isDead && inRange.has(key(u))).map((u) => u.instanceId)
    }

    set({ playerUnits, subPhase: 'selecting-action', actionTargets: targets, moveRange: new Set() })
  },

  confirmAction: (targetId) => {
    const s = get()
    if (s.subPhase !== 'selecting-action' || !s.selectedId) return
    const grid = s.grid!
    const unit = s.playerUnits.find((u) => u.instanceId === s.selectedId)!
    const cls = CLASSES[unit.classId]
    let log = s.log
    let playerUnits = s.playerUnits
    let enemyUnits = s.enemyUnits

    if (targetId && cls.weapon === 'staff') {
      const target = playerUnits.find((u) => u.instanceId === targetId)!
      const healed = healUnit(target, CLERIC_HEAL_AMOUNT)
      playerUnits = playerUnits.map((u) =>
        u.instanceId === targetId ? { ...u, hp: u.hp + healed } : u,
      )
      log = pushLog(s, [`${unit.name} tends to ${target.name}, healing ${healed} HP.`])
    } else if (targetId) {
      const target = enemyUnits.find((u) => u.instanceId === targetId)!
      const attackerTile = grid.tiles[unit.y][unit.x]
      const defenderTile = grid.tiles[target.y][target.x]
      const dist = Math.abs(unit.x - target.x) + Math.abs(unit.y - target.y)
      const result = resolveCombat(unit, target, attackerTile, defenderTile, dist)
      log = pushLog(s, result.log)
      playerUnits = playerUnits.map((u) =>
        u.instanceId === unit.instanceId ? { ...u, hp: result.attackerHpAfter, isDead: result.attackerDied } : u,
      )
      enemyUnits = enemyUnits.map((u) =>
        u.instanceId === target.instanceId ? { ...u, hp: result.defenderHpAfter, isDead: result.defenderDied } : u,
      )
      if (result.defenderDied) log = pushLog({ log }, [`${target.name} has fallen!`])
      if (result.attackerDied) log = pushLog({ log }, [`${unit.name} has fallen!`])
    }

    playerUnits = playerUnits.map((u) =>
      u.instanceId === unit.instanceId ? { ...u, hasActed: true } : u,
    )

    const outcome = checkOutcome(playerUnits, enemyUnits)
    set({
      playerUnits,
      enemyUnits,
      log,
      selectedId: null,
      subPhase: 'idle',
      moveRange: new Set(),
      actionTargets: [],
      phase: outcome ?? get().phase,
    })

    if (outcome) {
      useRunStore.getState().applyBattleResult(
        playerUnits.filter((u) => !u.isDead),
        outcome === 'victory',
      )
    }
  },

  usePotion: () => {
    const s = get()
    if (!s.selectedId) return
    const run = useRunStore.getState()
    if (run.potions <= 0) return
    const unit = s.playerUnits.find((u) => u.instanceId === s.selectedId)
    if (!unit || unit.hp >= unit.stats.hp) return
    const healed = healUnit(unit, 20)
    run.addPotions(-1)
    const playerUnits = s.playerUnits.map((u) =>
      u.instanceId === unit.instanceId ? { ...u, hp: u.hp + healed, hasActed: true } : u,
    )
    set({
      playerUnits,
      log: pushLog(s, [`${unit.name} drinks a potion, recovering ${healed} HP.`]),
      selectedId: null,
      subPhase: 'idle',
      moveRange: new Set(),
      actionTargets: [],
    })
  },

  endPlayerPhase: () => {
    const s = get()
    if (s.phase !== 'player') return
    set({
      phase: 'enemy',
      selectedId: null,
      subPhase: 'idle',
      moveRange: new Set(),
      actionTargets: [],
      playerUnits: s.playerUnits.map((u) => ({ ...u, hasMoved: true, hasActed: true })),
    })
    get().runEnemyPhase()
  },

  runEnemyPhase: () => {
    let s = get()
    let playerUnits = [...s.playerUnits]
    let enemyUnits = [...s.enemyUnits]
    let log = s.log
    const grid = s.grid!

    for (const enemy of enemyUnits) {
      if (enemy.isDead) continue
      const outcome = checkOutcome(playerUnits, enemyUnits)
      if (outcome) break
      const all = [...playerUnits, ...enemyUnits]
      const action = planEnemyTurn(enemy, playerUnits, all, grid)
      enemyUnits = enemyUnits.map((u) =>
        u.instanceId === enemy.instanceId ? { ...u, x: action.moveTo.x, y: action.moveTo.y } : u,
      )
      const movedEnemy = enemyUnits.find((u) => u.instanceId === enemy.instanceId)!

      if (action.targetId) {
        const target = playerUnits.find((u) => u.instanceId === action.targetId)
        if (target && !target.isDead) {
          const attackerTile = grid.tiles[movedEnemy.y][movedEnemy.x]
          const defenderTile = grid.tiles[target.y][target.x]
          const dist = Math.abs(movedEnemy.x - target.x) + Math.abs(movedEnemy.y - target.y)
          const result = resolveCombat(movedEnemy, target, attackerTile, defenderTile, dist)
          log = pushLog({ log }, result.log)
          enemyUnits = enemyUnits.map((u) =>
            u.instanceId === movedEnemy.instanceId
              ? { ...u, hp: result.attackerHpAfter, isDead: result.attackerDied }
              : u,
          )
          playerUnits = playerUnits.map((u) =>
            u.instanceId === target.instanceId
              ? { ...u, hp: result.defenderHpAfter, isDead: result.defenderDied }
              : u,
          )
          if (result.defenderDied) log = pushLog({ log }, [`${target.name} has fallen!`])
          if (result.attackerDied) log = pushLog({ log }, [`${movedEnemy.name} has fallen!`])
        }
      }
    }

    const outcome = checkOutcome(playerUnits, enemyUnits)
    set({
      playerUnits: playerUnits.map((u) => ({ ...u, hasMoved: false, hasActed: false })),
      enemyUnits,
      log,
      phase: outcome ?? 'player',
      turn: s.turn + 1,
    })

    if (outcome) {
      useRunStore.getState().applyBattleResult(
        playerUnits.filter((u) => !u.isDead),
        outcome === 'victory',
      )
    }
  },
}))
