import type { TerrainDef, TerrainType } from './types'

export const TERRAIN: Record<TerrainType, TerrainDef> = {
  plain: { type: 'plain', label: 'Plain', moveCost: 1, defBonus: 0, passable: true },
  forest: { type: 'forest', label: 'Forest', moveCost: 2, defBonus: 2, passable: true },
  mountain: { type: 'mountain', label: 'Mountain', moveCost: 3, defBonus: 3, passable: true },
  fort: { type: 'fort', label: 'Fort', moveCost: 1, defBonus: 1, passable: true, healPct: 0.1 },
  water: { type: 'water', label: 'Water', moveCost: 1, defBonus: 0, passable: false },
}
