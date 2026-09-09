import { useState } from 'react'
import { useRunStore } from '../store/runStore'

export function RestNode() {
  const roster = useRunStore((s) => s.roster)
  const healRoster = useRunStore((s) => s.healRoster)
  const boostUnit = useRunStore((s) => s.boostUnit)
  const completeCurrentNode = useRunStore((s) => s.completeCurrentNode)
  const [mode, setMode] = useState<'choose' | 'train' | 'done'>('choose')

  return (
    <div className="screen">
      <div className="screen-header">
        <h1>A Quiet Camp</h1>
      </div>

      {mode === 'choose' && (
        <>
          <p className="screen-lead">Your company can rest here a while. Choose how to spend it.</p>
          <div className="choice-grid choice-grid--2">
            <div className="panel choice-card">
              <h3>Full Rest</h3>
              <p>Heal every unit in your company to full HP.</p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  healRoster(1)
                  setMode('done')
                }}
              >
                Rest
              </button>
            </div>
            <div className="panel choice-card">
              <h3>Drill Formation</h3>
              <p>Pick one unit to train. +2 ATK and +2 DEF, permanently, for the rest of this run.</p>
              <button type="button" className="btn btn-primary" onClick={() => setMode('train')}>
                Train
              </button>
            </div>
          </div>
        </>
      )}

      {mode === 'train' && (
        <>
          <p className="screen-lead">Who drills today?</p>
          <div className="choice-grid">
            {roster.map((u) => (
              <div key={u.instanceId} className="panel choice-card">
                <h3>{u.name}</h3>
                <p>
                  ATK {u.stats.atk} → {u.stats.atk + 2}, DEF {u.stats.def} → {u.stats.def + 2}
                </p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    boostUnit(u.instanceId, 2, 2)
                    setMode('done')
                  }}
                >
                  Choose {u.name}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {mode === 'done' && (
        <div className="panel">
          <p>Your company breaks camp, refreshed.</p>
          <button type="button" className="btn btn-primary" onClick={completeCurrentNode}>
            Continue
          </button>
        </div>
      )}
    </div>
  )
}
