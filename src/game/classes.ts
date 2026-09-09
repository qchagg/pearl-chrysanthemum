import type { ClassDef, ClassId } from './types'

export const CLERIC_HEAL_AMOUNT = 8

export const CLASSES: Record<ClassId, ClassDef> = {
  vanguard: {
    id: 'vanguard',
    name: 'Vanguard',
    weapon: 'sword',
    range: [1, 1],
    baseStats: { hp: 20, atk: 6, def: 4, spd: 7, mov: 5 },
    growth: { hp: 3, atk: 1.2, def: 0.8, spd: 1, mov: 0 },
    critBonus: 5,
    description: 'Balanced swordfighter. Reliable in any matchup.',
    color: '#5b8ff9',
  },
  berserker: {
    id: 'berserker',
    name: 'Berserker',
    weapon: 'axe',
    range: [1, 1],
    baseStats: { hp: 24, atk: 9, def: 2, spd: 5, mov: 4 },
    growth: { hp: 3.5, atk: 1.6, def: 0.4, spd: 0.6, mov: 0 },
    critBonus: 15,
    description: 'Heavy hitter with big axes. Fragile but ferocious.',
    color: '#e8684a',
  },
  lancer: {
    id: 'lancer',
    name: 'Lancer',
    weapon: 'lance',
    range: [1, 1],
    baseStats: { hp: 22, atk: 7, def: 5, spd: 6, mov: 6 },
    growth: { hp: 3, atk: 1, def: 1, spd: 0.8, mov: 0 },
    critBonus: 5,
    description: 'Mobile spear cavalry. Great at flanking.',
    color: '#65c294',
  },
  knight: {
    id: 'knight',
    name: 'Knight',
    weapon: 'lance',
    range: [1, 1],
    baseStats: { hp: 30, atk: 6, def: 9, spd: 3, mov: 3 },
    growth: { hp: 4, atk: 0.8, def: 1.4, spd: 0.3, mov: 0 },
    critBonus: 0,
    description: 'Armored wall. Slow, but shrugs off hits.',
    color: '#9c9c9c',
  },
  ranger: {
    id: 'ranger',
    name: 'Ranger',
    weapon: 'bow',
    range: [1, 2],
    baseStats: { hp: 18, atk: 6, def: 3, spd: 8, mov: 5 },
    growth: { hp: 2.6, atk: 1.1, def: 0.5, spd: 1.1, mov: 0 },
    critBonus: 10,
    description: 'Strikes from two tiles away. Weak up close.',
    color: '#c98bd6',
  },
  cleric: {
    id: 'cleric',
    name: 'Cleric',
    weapon: 'staff',
    range: [1, 1],
    baseStats: { hp: 16, atk: 0, def: 2, spd: 6, mov: 5 },
    growth: { hp: 2.4, atk: 0, def: 0.4, spd: 0.7, mov: 0 },
    critBonus: 0,
    description: `Cannot attack, but mends allies for ${CLERIC_HEAL_AMOUNT} HP.`,
    color: '#f4d35e',
  },
}

// Sword > Axe > Lance > Sword. Bow and Staff sit outside the triangle.
export function triangleModifier(atkWeapon: string, defWeapon: string): number {
  const beats: Record<string, string> = {
    sword: 'axe',
    axe: 'lance',
    lance: 'sword',
  }
  if (beats[atkWeapon] === defWeapon) return 1
  if (beats[defWeapon] === atkWeapon) return -1
  return 0
}
