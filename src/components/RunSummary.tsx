import { useMetaStore } from '../store/metaStore'
import { useRunStore } from '../store/runStore'

export function RunSummary() {
  const victorious = useRunStore((s) => s.victorious)
  const act = useRunStore((s) => s.act)
  const nodesCleared = useRunStore((s) => s.nodesCleared)
  const goTo = useRunStore((s) => s.goTo)
  const lastRenownEarned = useRunStore((s) => s.lastRenownEarned)
  const renown = useMetaStore((s) => s.renown)

  return (
    <div className="screen screen--center">
      <div className={`run-summary ${victorious ? 'run-summary--victory' : 'run-summary--defeat'}`}>
        <h1>{victorious ? 'The Road Ends in Victory' : 'Your Company Has Fallen'}</h1>
        <p>
          {victorious
            ? 'You broke the last stronghold and secured the road. Word of your company spreads.'
            : `Your company was overwhelmed in Act ${act}, having cleared ${nodesCleared} sites along the way.`}
        </p>
        <div className="panel run-summary__stats">
          <div>
            <span className="stat-label">Renown Earned</span>
            <span className="stat-value stat-value--gold">+{lastRenownEarned}</span>
          </div>
          <div>
            <span className="stat-label">Renown Bank</span>
            <span className="stat-value stat-value--gold">{renown}</span>
          </div>
        </div>
        <button type="button" className="btn btn-primary btn-lg" onClick={() => goTo('menu')}>
          Return to Menu
        </button>
      </div>
    </div>
  )
}
