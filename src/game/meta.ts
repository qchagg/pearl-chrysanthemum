export interface MetaUpgradeDef {
  id: string
  name: string
  description: string
  maxTier: number
  costFor: (tier: number) => number // cost to go from `tier` to `tier + 1`
}

export const META_UPGRADES: MetaUpgradeDef[] = [
  {
    id: 'warChest',
    name: 'War Chest',
    description: '+25 starting gold per tier.',
    maxTier: 4,
    costFor: (tier) => 30 + tier * 25,
  },
  {
    id: 'recruitTraining',
    name: 'Recruit Training',
    description: '+1 ATK for every unit in your roster, per tier.',
    maxTier: 3,
    costFor: (tier) => 60 + tier * 50,
  },
  {
    id: 'reinforcements',
    name: 'Reinforcements',
    description: '+1 active roster slot per tier.',
    maxTier: 2,
    costFor: (tier) => 100 + tier * 80,
  },
  {
    id: 'fieldMedicine',
    name: 'Field Medicine',
    description: '+1 healing potion at the start of each run, per tier.',
    maxTier: 3,
    costFor: (tier) => 40 + tier * 30,
  },
]

export const BASE_ROSTER_CAP = 4
export const BASE_STARTING_GOLD = 50

export function renownReward(act: number, bossDefeated: boolean, nodesCleared: number): number {
  const base = nodesCleared * 4
  const actBonus = (act - 1) * 20
  const bossBonus = bossDefeated ? 30 : 0
  return base + actBonus + bossBonus
}
