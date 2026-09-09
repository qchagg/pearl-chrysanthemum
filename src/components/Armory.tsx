import { META_UPGRADES } from '../game/meta'
import { useMetaStore } from '../store/metaStore'
import { useRunStore } from '../store/runStore'

export function Armory() {
  const renown = useMetaStore((s) => s.renown)
  const tiers = useMetaStore((s) => s.tiers)
  const purchase = useMetaStore((s) => s.purchase)
  const goTo = useRunStore((s) => s.goTo)

  return (
    <div className="screen">
      <div className="screen-header">
        <h1>Armory</h1>
        <div className="pill pill--gold">{renown} Renown</div>
      </div>
      <p className="screen-lead">
        Spend Renown earned from past runs on permanent upgrades. These carry into every future run.
      </p>

      <div className="upgrade-grid">
        {META_UPGRADES.map((def) => {
          const tier = tiers[def.id] ?? 0
          const maxed = tier >= def.maxTier
          const cost = maxed ? null : def.costFor(tier)
          const affordable = cost !== null && renown >= cost
          return (
            <div key={def.id} className="panel upgrade-card">
              <div className="upgrade-card__header">
                <h3>{def.name}</h3>
                <span className="pill">
                  Tier {tier}/{def.maxTier}
                </span>
              </div>
              <p>{def.description}</p>
              <button
                type="button"
                className="btn btn-primary"
                disabled={maxed || !affordable}
                onClick={() => purchase(def.id)}
              >
                {maxed ? 'Maxed' : `Upgrade — ${cost} Renown`}
              </button>
            </div>
          )
        })}
      </div>

      <button type="button" className="btn" onClick={() => goTo('menu')}>
        Back to Menu
      </button>
    </div>
  )
}
