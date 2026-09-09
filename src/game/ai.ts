import { CLASSES } from './classes'
import { computeMoveRange, distance, key } from './grid'
import type { BattleGrid, Unit } from './types'

export interface AiAction {
  moveTo: { x: number; y: number }
  targetId: string | null
}

/** Decide one enemy unit's move + optional attack target for this turn. */
export function planEnemyTurn(
  enemy: Unit,
  playerUnits: Unit[],
  allUnits: Unit[],
  grid: BattleGrid,
): AiAction {
  const moveRange = computeMoveRange(enemy, grid, allUnits)
  const range = CLASSES[enemy.classId].range
  const livingPlayers = playerUnits.filter((u) => !u.isDead)

  if (livingPlayers.length === 0) {
    return { moveTo: { x: enemy.x, y: enemy.y }, targetId: null }
  }

  const nearest = livingPlayers.reduce((best, p) =>
    distance(enemy, p) < distance(enemy, best) ? p : best,
  )

  // Prefer a reachable tile that puts the nearest target in attack range.
  let bestTile: { x: number; y: number } | null = null
  let bestDist = Infinity
  for (const k of moveRange) {
    const [x, y] = k.split(',').map(Number)
    const d = distance({ x, y }, nearest)
    if (d >= range[0] && d <= range[1] && d < bestDist) {
      bestDist = d
      bestTile = { x, y }
    }
  }
  if (bestTile) return { moveTo: bestTile, targetId: nearest.instanceId }

  // Otherwise, approach: pick the reachable tile that minimizes distance to target.
  let approachTile = { x: enemy.x, y: enemy.y }
  let approachDist = distance(enemy, nearest)
  for (const k of moveRange) {
    const [x, y] = k.split(',').map(Number)
    const d = distance({ x, y }, nearest)
    if (d < approachDist) {
      approachDist = d
      approachTile = { x, y }
    }
  }
  return { moveTo: approachTile, targetId: null }
}

export function tileKeyOf(x: number, y: number): string {
  return key({ x, y })
}
