import { useState } from 'react'
import { useRunStore } from '../store/runStore'

const POTION_COST = 15
const TONIC_COST = 35

export function ShopNode() {
  const gold = useRunStore((s) => s.gold)
  const potions = useRunStore((s) => s.potions)
  const roster = useRunStore((s) => s.roster)
  const addGold = useRunStore((s) => s.addGold)
  const addPotions = useRunStore((s) => s.addPotions)
  const boostUnit = useRunStore((s) => s.boostUnit)
  const completeCurrentNode = useRunStore((s) => s.completeCurrentNode)
  const [tonicTarget, setTonicTarget] = useState<string | null>(null)

  function buyPotion() {
    if (gold < POTION_COST) return
    addGold(-POTION_COST)
    addPotions(1)
  }

  function buyTonic() {
    if (!tonicTarget || gold < TONIC_COST) return
    const unit = roster.find((u) => u.instanceId === tonicTarget)
    if (!unit) return
    boostUnit(tonicTarget, 2, 0)
    addGold(-TONIC_COST)
    setTonicTarget(null)
  }

  return (
    <div className="screen">
      <div className="screen-header">
        <h1>Roadside Shop</h1>
        <div className="pill pill--gold">{gold} Gold</div>
      </div>

      <div className="shop-grid">
        <div className="panel shop-item">
          <h3>Healing Potion</h3>
          <p>Restores 20 HP to a unit mid-battle. You have {potions}.</p>
          <button type="button" className="btn btn-primary" disabled={gold < POTION_COST} onClick={buyPotion}>
            Buy — {POTION_COST} Gold
          </button>
        </div>

        <div className="panel shop-item">
          <h3>Stat Tonic</h3>
          <p>Permanently grants +2 ATK to one of your units, for the rest of this run.</p>
          <select
            className="select"
            value={tonicTarget ?? ''}
            onChange={(e) => setTonicTarget(e.target.value || null)}
          >
            <option value="">Choose a unit…</option>
            {roster.map((u) => (
              <option key={u.instanceId} value={u.instanceId}>
                {u.name} (ATK {u.stats.atk})
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!tonicTarget || gold < TONIC_COST}
            onClick={buyTonic}
          >
            Buy — {TONIC_COST} Gold
          </button>
        </div>
      </div>

      <button type="button" className="btn" onClick={completeCurrentNode}>
        Leave Shop
      </button>
    </div>
  )
}
