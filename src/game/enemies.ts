import { createUnit } from './units'
import type { ClassId, Unit } from './types'

const ENEMY_NAMES: Record<ClassId, string[]> = {
  vanguard: ['Raider', 'Outrider', 'Marauder'],
  berserker: ['Brute', 'Reaver', 'Warbrand'],
  lancer: ['Skirmisher', 'Piker', 'Roughrider'],
  knight: ['Ironclad', 'Sentinel', 'Bulwark'],
  ranger: ['Sniper', 'Poacher', 'Trapper'],
  cleric: ['Cultist Healer', 'Hexweaver', 'Acolyte'],
}

const BOSS_NAMES = ['Warlord Kessin', 'The Ashen Baron', 'Grael the Hollow']

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// Enemy classes skew toward offense; clerics rarely appear except as support casters.
const NORMAL_POOL: ClassId[] = ['vanguard', 'berserker', 'lancer', 'knight', 'ranger']

export function generateEnemies(act: number, difficulty: 'battle' | 'elite' | 'boss'): Unit[] {
  const baseLevel = act * 2 + (difficulty === 'elite' ? 2 : difficulty === 'boss' ? 4 : 0)
  const count = difficulty === 'battle' ? 3 + Math.min(act, 2) : difficulty === 'elite' ? 4 + Math.min(act, 2) : 1

  if (difficulty === 'boss') {
    const boss = createUnit('knight', baseLevel + 3, pick(BOSS_NAMES))
    boss.isBoss = true
    boss.stats.hp = Math.round(boss.stats.hp * 1.6)
    boss.hp = boss.stats.hp
    boss.stats.atk += 3
    const escorts = Array.from({ length: 2 + Math.min(act, 2) }, () => {
      const cls = pick(NORMAL_POOL)
      return createUnit(cls, baseLevel, `${pick(ENEMY_NAMES[cls])}`)
    })
    return [boss, ...escorts]
  }

  return Array.from({ length: count }, () => {
    const cls = pick(NORMAL_POOL)
    const lvl = Math.max(1, baseLevel + Math.floor(Math.random() * 2))
    return createUnit(cls, lvl, pick(ENEMY_NAMES[cls]))
  })
}
