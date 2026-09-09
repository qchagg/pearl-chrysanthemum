// Core data model for Skirmish Road.

export type WeaponType = 'sword' | 'axe' | 'lance' | 'bow' | 'staff'

export type TerrainType = 'plain' | 'forest' | 'mountain' | 'fort' | 'water'

export interface TerrainDef {
  type: TerrainType
  label: string
  moveCost: number
  defBonus: number
  passable: boolean
  healPct?: number
}

export interface Stats {
  hp: number
  atk: number
  def: number
  spd: number
  mov: number
}

export type ClassId =
  | 'vanguard'
  | 'berserker'
  | 'lancer'
  | 'knight'
  | 'ranger'
  | 'cleric'

export interface ClassDef {
  id: ClassId
  name: string
  weapon: WeaponType
  range: [number, number] // min, max attack range
  baseStats: Stats
  growth: Partial<Stats> // stat gained per level-up
  critBonus: number
  description: string
  color: string
}

export interface Unit {
  instanceId: string
  classId: ClassId
  name: string
  level: number
  exp: number
  stats: Stats // current effective max stats (base + growth*level + meta)
  hp: number // current hp
  x: number
  y: number
  hasMoved: boolean
  hasActed: boolean
  isDead: boolean
  isBoss?: boolean
}

export interface EnemyTemplate {
  id: string
  name: string
  classId: ClassId
  levelRange: [number, number]
  isBoss?: boolean
}

export interface Tile {
  x: number
  y: number
  terrain: TerrainType
}

export interface BattleGrid {
  width: number
  height: number
  tiles: Tile[][]
  playerSpawns: { x: number; y: number }[]
  enemySpawns: { x: number; y: number }[]
}

export type NodeType =
  | 'battle'
  | 'elite'
  | 'recruit'
  | 'shop'
  | 'rest'
  | 'event'
  | 'boss'

export interface MapNode {
  id: string
  act: number
  row: number
  col: number
  type: NodeType
  connectsTo: string[]
  cleared: boolean
}

export interface RunMap {
  act: number
  nodes: MapNode[]
  rows: number
}

export interface Item {
  id: string
  name: string
  description: string
  kind: 'potion' | 'tonic'
}

export type CombatLogEntry = {
  id: string
  text: string
}
