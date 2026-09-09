import { useMemo, useState } from 'react'
import { randomEvent } from '../game/events'
import { useRunStore } from '../store/runStore'

export function EventNode() {
  const currentNodeId = useRunStore((s) => s.currentNodeId)
  const addGold = useRunStore((s) => s.addGold)
  const healRoster = useRunStore((s) => s.healRoster)
  const addPotions = useRunStore((s) => s.addPotions)
  const completeCurrentNode = useRunStore((s) => s.completeCurrentNode)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const event = useMemo(() => randomEvent(), [currentNodeId])
  const [result, setResult] = useState<string | null>(null)

  function choose(choice: (typeof event.choices)[number]) {
    const outcome = choice.resolve()
    if (outcome.goldDelta) addGold(outcome.goldDelta)
    if (outcome.hpDeltaPct) healRoster(outcome.hpDeltaPct)
    if (outcome.item) addPotions(1)
    setResult(outcome.text)
  }

  return (
    <div className="screen">
      <div className="screen-header">
        <h1>{event.title}</h1>
      </div>

      {!result ? (
        <>
          <p className="screen-lead">{event.body}</p>
          <div className="choice-grid choice-grid--2">
            {event.choices.map((choice) => (
              <button
                key={choice.label}
                type="button"
                className="btn btn-primary btn-lg"
                onClick={() => choose(choice)}
              >
                {choice.label}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="panel">
          <p>{result}</p>
          <button type="button" className="btn btn-primary" onClick={completeCurrentNode}>
            Continue
          </button>
        </div>
      )}
    </div>
  )
}
