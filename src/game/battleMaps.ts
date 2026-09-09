import type { BattleGrid, TerrainType, Tile } from './types'

const WIDTH = 8
const HEIGHT = 6

function emptyGrid(): TerrainType[][] {
  return Array.from({ length: HEIGHT }, () => Array.from({ length: WIDTH }, () => 'plain' as TerrainType))
}

function scatter(grid: TerrainType[][], terrain: TerrainType, count: number, rng: () => number) {
  let placed = 0
  let guard = 0
  while (placed < count && guard < count * 20) {
    guard += 1
    const x = Math.floor(rng() * WIDTH)
    const y = Math.floor(rng() * HEIGHT)
    if (x <= 1 || x >= WIDTH - 2) continue // keep spawn lanes clear
    if (grid[y][x] === 'plain') {
      grid[y][x] = terrain
      placed += 1
    }
  }
}

function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function generateBattleGrid(seed: number, difficulty: 'battle' | 'elite' | 'boss'): BattleGrid {
  const rng = mulberry32(seed)
  const terrainGrid = emptyGrid()
  scatter(terrainGrid, 'forest', 4 + Math.floor(rng() * 3), rng)
  scatter(terrainGrid, 'mountain', 2 + Math.floor(rng() * 2), rng)
  scatter(terrainGrid, 'fort', 1 + (difficulty === 'boss' ? 1 : 0), rng)

  const tiles: Tile[][] = terrainGrid.map((row, y) =>
    row.map((terrain, x) => ({ x, y, terrain })),
  )

  const playerSpawns = [0, 1, 2, 3].map((i) => ({ x: 0, y: 1 + i }))
  const enemyCount = difficulty === 'battle' ? 4 : difficulty === 'elite' ? 5 : 6
  const enemySpawns = Array.from({ length: enemyCount }, (_, i) => ({
    x: WIDTH - 1,
    y: 1 + (i % (HEIGHT - 2)),
  }))

  return { width: WIDTH, height: HEIGHT, tiles, playerSpawns, enemySpawns }
}
