import { create } from 'zustand'
import type { ClassId, RunMap, Unit } from '../game/types'
import { generateRunMap } from '../game/mapGen'
import { createUnit, STARTER_CLASSES } from '../game/units'
import { BASE_ROSTER_CAP, BASE_STARTING_GOLD, renownReward } from '../game/meta'
import { useMetaStore } from './metaStore'

export type Screen =
  | 'menu'
  | 'armory'
  | 'map'
  | 'battle'
  | 'recruit'
  | 'shop'
  | 'rest'
  | 'event'
  | 'runSummary'

export interface Notice {
  title: string
  lines: string[]
}

interface RunState {
  screen: Screen
  act: number
  map: RunMap | null
  currentNodeId: string | null
  roster: Unit[]
  rosterCap: number
  gold: number
  potions: number
  nodesCleared: number
  notice: Notice | null
  victorious: boolean | null
  lastRenownEarned: number

  startNewRun: () => void
  goTo: (screen: Screen) => void
  enterNode: (nodeId: string) => void
  reachableNodeIds: () => Set<string>
  completeCurrentNode: () => void
  applyBattleResult: (survivors: Unit[], victory: boolean) => void
  addGold: (amount: number) => void
  addPotions: (amount: number) => void
  recruit: (classId: ClassId) => void
  healRoster: (pct: number) => void
  boostUnit: (instanceId: string, atk: number, def: number) => void
  removeFromRoster: (instanceId: string) => void
  clearNotice: () => void
  endRun: (victory: boolean) => void
}

function buildStarterRoster(): Unit[] {
  return STARTER_CLASSES.map((c) => createUnit(c, 1))
}

export const useRunStore = create<RunState>()((set, get) => ({
  screen: 'menu',
  act: 1,
  map: null,
  currentNodeId: null,
  roster: [],
  rosterCap: BASE_ROSTER_CAP,
  gold: BASE_STARTING_GOLD,
  potions: 0,
  nodesCleared: 0,
  notice: null,
  victorious: null,
  lastRenownEarned: 0,

  startNewRun: () => {
    const meta = useMetaStore.getState()
    const warChestTier = meta.tierOf('warChest')
    const reinforcementsTier = meta.tierOf('reinforcements')
    const trainingTier = meta.tierOf('recruitTraining')
    const medicineTier = meta.tierOf('fieldMedicine')

    const roster = buildStarterRoster()
    if (trainingTier > 0) {
      for (const u of roster) {
        u.stats.atk += trainingTier
      }
    }

    set({
      screen: 'map',
      act: 1,
      map: generateRunMap(1),
      currentNodeId: null,
      roster,
      rosterCap: BASE_ROSTER_CAP + reinforcementsTier,
      gold: BASE_STARTING_GOLD + warChestTier * 25,
      potions: medicineTier,
      nodesCleared: 0,
      notice: null,
      victorious: null,
      lastRenownEarned: 0,
    })
  },

  goTo: (screen) => set({ screen }),

  reachableNodeIds: () => {
    const { map, currentNodeId } = get()
    if (!map) return new Set()
    if (currentNodeId === null) {
      return new Set(map.nodes.filter((n) => n.row === 0).map((n) => n.id))
    }
    const current = map.nodes.find((n) => n.id === currentNodeId)
    if (!current) return new Set()
    return new Set(current.connectsTo)
  },

  enterNode: (nodeId) => {
    const { map } = get()
    if (!map) return
    const node = map.nodes.find((n) => n.id === nodeId)
    if (!node) return
    set({ currentNodeId: nodeId })
    if (node.type === 'battle' || node.type === 'elite' || node.type === 'boss') {
      set({ screen: 'battle' })
    } else {
      set({ screen: node.type })
    }
  },

  completeCurrentNode: () => {
    const { map, currentNodeId } = get()
    if (!map || !currentNodeId) return
    const node = map.nodes.find((n) => n.id === currentNodeId)
    if (!node) return
    node.cleared = true
    set({ map: { ...map }, nodesCleared: get().nodesCleared + 1, screen: 'map' })
  },

  applyBattleResult: (survivors, victory) => {
    const { map, currentNodeId, act } = get()
    const node = map?.nodes.find((n) => n.id === currentNodeId)
    set({ roster: survivors })

    if (!victory || survivors.length === 0) {
      get().endRun(false)
      return
    }

    if (node) node.cleared = true

    if (node?.type === 'boss') {
      if (act >= 3) {
        get().endRun(true)
        return
      }
      const nextAct = act + 1
      set({
        act: nextAct,
        map: generateRunMap(nextAct),
        currentNodeId: null,
        screen: 'map',
        notice: {
          title: `Act ${act} cleared!`,
          lines: [`The boss has fallen. Onward to Act ${nextAct}.`],
        },
      })
      return
    }

    const goldReward = node?.type === 'elite' ? 40 + act * 10 : 20 + act * 5
    get().addGold(goldReward)
    set({
      map: map ? { ...map } : map,
      nodesCleared: get().nodesCleared + 1,
      screen: 'map',
      notice: { title: 'Victory!', lines: [`+${goldReward} gold.`] },
    })
  },

  addGold: (amount) => set((s) => ({ gold: Math.max(0, s.gold + amount) })),
  addPotions: (amount) => set((s) => ({ potions: Math.max(0, s.potions + amount) })),

  recruit: (classId) => {
    const { roster, rosterCap } = get()
    if (roster.length >= rosterCap) return
    set({ roster: [...roster, createUnit(classId, 1)] })
  },

  healRoster: (pct) => {
    set((s) => ({
      roster: s.roster.map((u) => ({
        ...u,
        hp: Math.min(u.stats.hp, Math.round(u.hp + u.stats.hp * pct)),
      })),
    }))
  },

  boostUnit: (instanceId, atk, def) =>
    set((s) => ({
      roster: s.roster.map((u) =>
        u.instanceId === instanceId
          ? { ...u, stats: { ...u.stats, atk: u.stats.atk + atk, def: u.stats.def + def } }
          : u,
      ),
    })),

  removeFromRoster: (instanceId) =>
    set((s) => ({ roster: s.roster.filter((u) => u.instanceId !== instanceId) })),

  clearNotice: () => set({ notice: null }),

  endRun: (victory) => {
    const { act, nodesCleared } = get()
    const reward = renownReward(act, victory, nodesCleared)
    useMetaStore.getState().addRenown(reward)
    useMetaStore.getState().recordRunEnd(act, victory)
    set({ screen: 'runSummary', victorious: victory, lastRenownEarned: reward })
  },
}))
