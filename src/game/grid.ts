import { TERRAIN } from './terrain'
import type { BattleGrid, Unit } from './types'

export interface Point {
  x: number
  y: number
}

function neighbors(p: Point, grid: BattleGrid): Point[] {
  const out: Point[] = []
  const deltas = [
    [1, 0], [-1, 0], [0, 1], [0, -1],
  ]
  for (const [dx, dy] of deltas) {
    const nx = p.x + dx
    const ny = p.y + dy
    if (nx >= 0 && nx < grid.width && ny >= 0 && ny < grid.height) out.push({ x: nx, y: ny })
  }
  return out
}

export function key(p: Point): string {
  return `${p.x},${p.y}`
}

/** Tiles reachable within a unit's move stat, given terrain cost and blocking units. */
export function computeMoveRange(unit: Unit, grid: BattleGrid, allUnits: Unit[]): Set<string> {
  const occupied = new Set(
    allUnits.filter((u) => u.instanceId !== unit.instanceId && !u.isDead).map((u) => key(u)),
  )
  const cost = new Map<string, number>()
  cost.set(key(unit), 0)
  const frontier: Point[] = [{ x: unit.x, y: unit.y }]

  while (frontier.length) {
    const current = frontier.shift()!
    const currentCost = cost.get(key(current))!
    for (const n of neighbors(current, grid)) {
      const terrain = TERRAIN[grid.tiles[n.y][n.x].terrain]
      if (!terrain.passable) continue
      if (occupied.has(key(n))) continue
      const newCost = currentCost + terrain.moveCost
      if (newCost > unit.stats.mov) continue
      const existing = cost.get(key(n))
      if (existing === undefined || newCost < existing) {
        cost.set(key(n), newCost)
        frontier.push(n)
      }
    }
  }
  return new Set(cost.keys())
}

/** Tiles a unit could attack from a given standing position, at the class's weapon range. */
export function computeAttackRange(
  from: Point,
  range: [number, number],
  grid: BattleGrid,
): Set<string> {
  const out = new Set<string>()
  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      const dist = Math.abs(x - from.x) + Math.abs(y - from.y)
      if (dist >= range[0] && dist <= range[1]) out.add(key({ x, y }))
    }
  }
  return out
}

export function distance(a: Point, b: Point): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
}
