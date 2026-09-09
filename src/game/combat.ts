import { CLASSES, triangleModifier } from './classes'
import { TERRAIN } from './terrain'
import type { Tile, Unit } from './types'

export interface CombatResult {
  log: string[]
  attackerHpAfter: number
  defenderHpAfter: number
  defenderDied: boolean
  attackerDied: boolean
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function hitChance(attacker: Unit, defender: Unit, tri: number): number {
  const base = 85 + (attacker.stats.spd - defender.stats.spd) + tri * 15
  return clamp(base, 25, 98)
}

function critChance(attacker: Unit): number {
  return CLASSES[attacker.classId].critBonus
}

function damageOf(attacker: Unit, defender: Unit, defTile: Tile | undefined, tri: number): number {
  const terrainDef = defTile ? TERRAIN[defTile.terrain].defBonus : 0
  const base = attacker.stats.atk - defender.stats.def - terrainDef + tri
  return Math.max(1, Math.round(base))
}

function rollHit(pct: number): boolean {
  return Math.random() * 100 < pct
}

/**
 * One-sided strike. Does not apply doubling or counters directly;
 * resolveCombat orchestrates the full exchange.
 */
function strike(attacker: Unit, defender: Unit, defTile: Tile | undefined, log: string[]): number {
  const tri = triangleModifier(CLASSES[attacker.classId].weapon, CLASSES[defender.classId].weapon)
  const hit = hitChance(attacker, defender, tri)
  if (!rollHit(hit)) {
    log.push(`${attacker.name} attacks ${defender.name} — miss!`)
    return 0
  }
  const isCrit = rollHit(critChance(attacker))
  let dmg = damageOf(attacker, defender, defTile, tri)
  if (isCrit) dmg *= 3
  log.push(
    `${attacker.name} attacks ${defender.name} for ${dmg} damage${isCrit ? ' (CRITICAL!)' : ''}.`,
  )
  return dmg
}

export function resolveCombat(
  attacker: Unit,
  defender: Unit,
  attackerTile: Tile | undefined,
  defenderTile: Tile | undefined,
  range: number,
): CombatResult {
  const log: string[] = []
  let attHp = attacker.hp
  let defHp = defender.hp

  const dmg1 = strike(attacker, defender, defenderTile, log)
  defHp = Math.max(0, defHp - dmg1)

  const defenderCanCounter = range === 1 && defHp > 0 && CLASSES[defender.classId].weapon !== 'staff'
  if (defenderCanCounter) {
    const dmg2 = strike(defender, { ...attacker, hp: attHp }, attackerTile, log)
    attHp = Math.max(0, attHp - dmg2)
  }

  const attackerDoubles =
    attHp > 0 && defHp > 0 && attacker.stats.spd - defender.stats.spd >= 4 && range <= 1
  if (attackerDoubles) {
    const dmg3 = strike(attacker, { ...defender, hp: defHp }, defenderTile, log)
    defHp = Math.max(0, defHp - dmg3)
  }

  return {
    log,
    attackerHpAfter: attHp,
    defenderHpAfter: defHp,
    defenderDied: defHp <= 0,
    attackerDied: attHp <= 0,
  }
}

export function healUnit(target: Unit, amount: number): number {
  const healed = Math.min(target.stats.hp - target.hp, amount)
  return Math.max(0, healed)
}
