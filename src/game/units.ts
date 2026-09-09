import { CLASSES } from './classes'
import type { ClassId, Stats, Unit } from './types'

let idCounter = 0
export function nextId(prefix: string): string {
  idCounter += 1
  return `${prefix}-${idCounter}-${Date.now().toString(36)}`
}

const FIRST_NAMES = [
  'Ari', 'Bram', 'Cass', 'Dorin', 'Eli', 'Fenna', 'Guy', 'Hesper',
  'Ilya', 'Joss', 'Kira', 'Lio', 'Maren', 'Nix', 'Orin', 'Pia',
  'Quill', 'Rasa', 'Soren', 'Tam', 'Uma', 'Vash', 'Wren', 'Yara',
]

export function randomName(): string {
  return FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]
}

export function computeStats(classId: ClassId, level: number, statBonus?: Partial<Stats>): Stats {
  const def = CLASSES[classId]
  const lv = level - 1
  const raw: Stats = {
    hp: Math.round(def.baseStats.hp + (def.growth.hp ?? 0) * lv),
    atk: Math.round(def.baseStats.atk + (def.growth.atk ?? 0) * lv),
    def: Math.round(def.baseStats.def + (def.growth.def ?? 0) * lv),
    spd: Math.round(def.baseStats.spd + (def.growth.spd ?? 0) * lv),
    mov: def.baseStats.mov + (def.growth.mov ?? 0) * lv,
  }
  if (statBonus) {
    raw.hp += statBonus.hp ?? 0
    raw.atk += statBonus.atk ?? 0
    raw.def += statBonus.def ?? 0
    raw.spd += statBonus.spd ?? 0
    raw.mov += statBonus.mov ?? 0
  }
  return raw
}

export function createUnit(
  classId: ClassId,
  level: number,
  name?: string,
  statBonus?: Partial<Stats>,
): Unit {
  const stats = computeStats(classId, level, statBonus)
  return {
    instanceId: nextId('unit'),
    classId,
    name: name ?? `${randomName()} the ${CLASSES[classId].name}`,
    level,
    exp: 0,
    stats,
    hp: stats.hp,
    x: 0,
    y: 0,
    hasMoved: false,
    hasActed: false,
    isDead: false,
  }
}

export const STARTER_CLASSES: ClassId[] = ['vanguard', 'lancer', 'cleric']
export const RECRUITABLE_CLASSES: ClassId[] = [
  'vanguard', 'berserker', 'lancer', 'knight', 'ranger', 'cleric',
]
