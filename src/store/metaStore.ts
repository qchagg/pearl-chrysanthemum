import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { META_UPGRADES } from '../game/meta'

interface MetaState {
  renown: number
  tiers: Record<string, number>
  bestAct: number
  runsCompleted: number
  addRenown: (amount: number) => void
  purchase: (upgradeId: string) => boolean
  recordRunEnd: (actReached: number, victorious: boolean) => void
  tierOf: (upgradeId: string) => number
}

export const useMetaStore = create<MetaState>()(
  persist(
    (set, get) => ({
      renown: 0,
      tiers: {},
      bestAct: 1,
      runsCompleted: 0,
      addRenown: (amount) => set((s) => ({ renown: s.renown + amount })),
      tierOf: (upgradeId) => get().tiers[upgradeId] ?? 0,
      purchase: (upgradeId) => {
        const def = META_UPGRADES.find((u) => u.id === upgradeId)
        if (!def) return false
        const state = get()
        const currentTier = state.tiers[upgradeId] ?? 0
        if (currentTier >= def.maxTier) return false
        const cost = def.costFor(currentTier)
        if (state.renown < cost) return false
        set({
          renown: state.renown - cost,
          tiers: { ...state.tiers, [upgradeId]: currentTier + 1 },
        })
        return true
      },
      recordRunEnd: (actReached, victorious) =>
        set((s) => ({
          bestAct: victorious ? Math.max(s.bestAct, actReached + 1) : Math.max(s.bestAct, actReached),
          runsCompleted: s.runsCompleted + 1,
        })),
    }),
    { name: 'skirmish-road-meta' },
  ),
)
