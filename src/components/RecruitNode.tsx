import { useMemo } from 'react'
import { CLASSES } from '../game/classes'
import { RECRUITABLE_CLASSES } from '../game/units'
import type { ClassId } from '../game/types'
import { useRunStore } from '../store/runStore'

function pickThree(): ClassId[] {
  const pool = [...RECRUITABLE_CLASSES]
  const picks: ClassId[] = []
  while (picks.length < 3 && pool.length) {
    const idx = Math.floor(Math.random() * pool.length)
    picks.push(pool.splice(idx, 1)[0])
  }
  return picks
}

export function RecruitNode() {
  const currentNodeId = useRunStore((s) => s.currentNodeId)
  const roster = useRunStore((s) => s.roster)
  const rosterCap = useRunStore((s) => s.rosterCap)
  const recruit = useRunStore((s) => s.recruit)
  const completeCurrentNode = useRunStore((s) => s.completeCurrentNode)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const choices = useMemo(() => pickThree(), [currentNodeId])
  const full = roster.length >= rosterCap

  return (
    <div className="screen">
      <div className="screen-header">
        <h1>A Wandering Fighter</h1>
      </div>
      <p className="screen-lead">
        {full
          ? `Your company is full (${roster.length}/${rosterCap}). You can still greet them, but there's no room in the ranks.`
          : 'Someone by the roadside offers to join your company. Choose one.'}
      </p>

      <div className="choice-grid">
        {choices.map((classId) => {
          const cls = CLASSES[classId]
          return (
            <div key={classId} className="panel choice-card" style={{ ['--class-color' as string]: cls.color }}>
              <h3>{cls.name}</h3>
              <p className="choice-card__weapon">{cls.weapon.toUpperCase()}</p>
              <p>{cls.description}</p>
              <button
                type="button"
                className="btn btn-primary"
                disabled={full}
                onClick={() => {
                  recruit(classId)
                  completeCurrentNode()
                }}
              >
                Recruit
              </button>
            </div>
          )
        })}
      </div>

      <button type="button" className="btn" onClick={completeCurrentNode}>
        Move On
      </button>
    </div>
  )
}
