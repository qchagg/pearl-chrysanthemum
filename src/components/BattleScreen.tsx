import { useEffect } from 'react'
import { useBattleStore } from '../store/battleStore'
import { useRunStore } from '../store/runStore'
import { CLASSES } from '../game/classes'
import { key } from '../game/grid'
import { HpBar } from './HpBar'
import type { Unit } from '../game/types'

export function BattleScreen() {
  const grid = useBattleStore((s) => s.grid)
  const playerUnits = useBattleStore((s) => s.playerUnits)
  const enemyUnits = useBattleStore((s) => s.enemyUnits)
  const phase = useBattleStore((s) => s.phase)
  const subPhase = useBattleStore((s) => s.subPhase)
  const selectedId = useBattleStore((s) => s.selectedId)
  const moveRange = useBattleStore((s) => s.moveRange)
  const actionTargets = useBattleStore((s) => s.actionTargets)
  const log = useBattleStore((s) => s.log)
  const turn = useBattleStore((s) => s.turn)
  const isElite = useBattleStore((s) => s.isElite)
  const isBoss = useBattleStore((s) => s.isBoss)

  const startBattle = useBattleStore((s) => s.startBattle)
  const selectUnit = useBattleStore((s) => s.selectUnit)
  const deselect = useBattleStore((s) => s.deselect)
  const moveSelectedTo = useBattleStore((s) => s.moveSelectedTo)
  const confirmAction = useBattleStore((s) => s.confirmAction)
  const usePotion = useBattleStore((s) => s.usePotion)
  const endPlayerPhase = useBattleStore((s) => s.endPlayerPhase)

  const potions = useRunStore((s) => s.potions)

  useEffect(() => {
    startBattle()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!grid) return <div className="screen">Loading battle…</div>

  const selectedUnit = playerUnits.find((u) => u.instanceId === selectedId) ?? null
  const allUnits = [...playerUnits, ...enemyUnits]

  function unitAt(x: number, y: number): Unit | undefined {
    return allUnits.find((u) => !u.isDead && u.x === x && u.y === y)
  }

  function handleTileClick(x: number, y: number) {
    if (phase !== 'player') return
    const occupant = unitAt(x, y)

    if (subPhase === 'idle') {
      if (occupant && playerUnits.includes(occupant)) selectUnit(occupant.instanceId)
      return
    }

    if (subPhase === 'selecting-move') {
      if (occupant && occupant.instanceId === selectedId) {
        deselect()
        return
      }
      if (occupant && playerUnits.includes(occupant) && !occupant.hasActed) {
        selectUnit(occupant.instanceId)
        return
      }
      if (moveRange.has(key({ x, y }))) moveSelectedTo(x, y)
      return
    }

    if (subPhase === 'selecting-action') {
      if (occupant && actionTargets.includes(occupant.instanceId)) {
        confirmAction(occupant.instanceId)
      }
    }
  }

  const cls = selectedUnit ? CLASSES[selectedUnit.classId] : null
  const isHealer = cls?.weapon === 'staff'

  return (
    <div className="screen battle-screen">
      <div className="screen-header">
        <h1>
          {isBoss ? 'Boss Battle' : isElite ? 'Elite Skirmish' : 'Skirmish'} — Turn {turn}
        </h1>
        <div className="pill-row">
          <div className="pill">{phase === 'player' ? 'Your Turn' : phase === 'enemy' ? 'Enemy Turn' : phase}</div>
        </div>
      </div>

      <div className="battle-layout">
        <div className="battle-board" style={{ gridTemplateColumns: `repeat(${grid.width}, 1fr)` }}>
          {grid.tiles.flatMap((row) =>
            row.map((tile) => {
              const occupant = unitAt(tile.x, tile.y)
              const k = key(tile)
              const isMoveOption = subPhase === 'selecting-move' && moveRange.has(k)
              const isTarget = occupant && subPhase === 'selecting-action' && actionTargets.includes(occupant.instanceId)
              const isSelected = occupant?.instanceId === selectedId
              return (
                <button
                  type="button"
                  key={k}
                  className={[
                    'battle-tile',
                    `battle-tile--${tile.terrain}`,
                    isMoveOption ? 'battle-tile--move' : '',
                    isTarget ? 'battle-tile--target' : '',
                    isSelected ? 'battle-tile--selected' : '',
                  ].join(' ')}
                  onClick={() => handleTileClick(tile.x, tile.y)}
                >
                  {occupant && (
                    <div
                      className={[
                        'unit-token',
                        playerUnits.includes(occupant) ? 'unit-token--player' : 'unit-token--enemy',
                        occupant.hasActed && playerUnits.includes(occupant) ? 'unit-token--spent' : '',
                        occupant.isBoss ? 'unit-token--boss' : '',
                      ].join(' ')}
                      style={{ ['--class-color' as string]: CLASSES[occupant.classId].color }}
                      title={occupant.name}
                    >
                      <span>{CLASSES[occupant.classId].name[0]}</span>
                      <HpBar hp={occupant.hp} maxHp={occupant.stats.hp} compact />
                    </div>
                  )}
                </button>
              )
            }),
          )}
        </div>

        <aside className="battle-sidebar">
          {selectedUnit && cls && (
            <div className="panel battle-selected">
              <h3>{selectedUnit.name}</h3>
              <p>
                Lv.{selectedUnit.level} {cls.name} · {cls.weapon}
              </p>
              <HpBar hp={selectedUnit.hp} maxHp={selectedUnit.stats.hp} />
              <div className="unit-card__stats">
                <span>ATK {selectedUnit.stats.atk}</span>
                <span>DEF {selectedUnit.stats.def}</span>
                <span>SPD {selectedUnit.stats.spd}</span>
                <span>MOV {selectedUnit.stats.mov}</span>
              </div>

              {subPhase === 'selecting-action' && (
                <div className="battle-actions">
                  <p className="battle-actions__hint">
                    {actionTargets.length > 0
                      ? isHealer
                        ? 'Tap a wounded ally to heal.'
                        : 'Tap an enemy to attack.'
                      : 'No targets in range.'}
                  </p>
                  <button type="button" className="btn" onClick={() => confirmAction(null)}>
                    Wait
                  </button>
                  {potions > 0 && selectedUnit.hp < selectedUnit.stats.hp && (
                    <button type="button" className="btn" onClick={usePotion}>
                      Use Potion ({potions})
                    </button>
                  )}
                </div>
              )}

              {subPhase === 'selecting-move' && (
                <div className="battle-actions">
                  <p className="battle-actions__hint">Tap a highlighted tile to move.</p>
                  <button type="button" className="btn" onClick={() => moveSelectedTo(selectedUnit.x, selectedUnit.y)}>
                    Wait Here
                  </button>
                  {potions > 0 && selectedUnit.hp < selectedUnit.stats.hp && (
                    <button type="button" className="btn" onClick={usePotion}>
                      Use Potion ({potions})
                    </button>
                  )}
                  <button type="button" className="btn" onClick={deselect}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="panel battle-log">
            <h3>Log</h3>
            <div className="battle-log__lines">
              {log.slice(-10).map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>

          {phase === 'player' && (
            <button type="button" className="btn btn-primary btn-lg" onClick={endPlayerPhase}>
              End Turn
            </button>
          )}
        </aside>
      </div>

      <div className="roster-strip">
        {playerUnits.map((u) => (
          <button
            key={u.instanceId}
            type="button"
            className={`roster-chip ${u.isDead ? 'roster-chip--dead' : ''} ${u.hasActed ? 'roster-chip--spent' : ''}`}
            onClick={() => !u.isDead && !u.hasActed && selectUnit(u.instanceId)}
            disabled={u.isDead || u.hasActed || phase !== 'player'}
          >
            <span>{u.name}</span>
            <span className="roster-chip__hp">
              {u.isDead ? 'Fallen' : `${u.hp}/${u.stats.hp} HP`}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
