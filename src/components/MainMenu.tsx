import { useMetaStore } from '../store/metaStore'
import { useRunStore } from '../store/runStore'

export function MainMenu() {
  const startNewRun = useRunStore((s) => s.startNewRun)
  const goTo = useRunStore((s) => s.goTo)
  const renown = useMetaStore((s) => s.renown)
  const bestAct = useMetaStore((s) => s.bestAct)
  const runsCompleted = useMetaStore((s) => s.runsCompleted)

  return (
    <div className="screen screen--center">
      <div className="menu-hero">
        <h1 className="menu-title">Skirmish Road</h1>
        <p className="menu-subtitle">A tactics roguelike. Choose your path. Guard your company.</p>
      </div>

      <div className="panel menu-stats">
        <div>
          <span className="stat-label">Renown</span>
          <span className="stat-value stat-value--gold">{renown}</span>
        </div>
        <div>
          <span className="stat-label">Furthest Act</span>
          <span className="stat-value">{bestAct}</span>
        </div>
        <div>
          <span className="stat-label">Runs Completed</span>
          <span className="stat-value">{runsCompleted}</span>
        </div>
      </div>

      <div className="menu-actions">
        <button type="button" className="btn btn-primary btn-lg" onClick={startNewRun}>
          Begin New Run
        </button>
        <button type="button" className="btn btn-lg" onClick={() => goTo('armory')}>
          Armory ({renown} Renown)
        </button>
      </div>

      <p className="menu-hint">
        Every unit that falls in battle is gone for the run. Recruit wisely, retreat never —
        there's no going back once the road is chosen.
      </p>
    </div>
  )
}
