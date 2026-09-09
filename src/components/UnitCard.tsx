import { CLASSES } from '../game/classes'
import type { Unit } from '../game/types'
import { HpBar } from './HpBar'

interface Props {
  unit: Unit
  selected?: boolean
  onClick?: () => void
  disabled?: boolean
}

export function UnitCard({ unit, selected, onClick, disabled }: Props) {
  const cls = CLASSES[unit.classId]
  return (
    <button
      type="button"
      className={`unit-card ${selected ? 'unit-card--selected' : ''} ${disabled ? 'unit-card--disabled' : ''}`}
      onClick={onClick}
      disabled={disabled}
      style={{ ['--class-color' as string]: cls.color }}
    >
      <div className="unit-card__badge">{cls.name[0]}</div>
      <div className="unit-card__body">
        <div className="unit-card__name">{unit.name}</div>
        <div className="unit-card__class">
          Lv.{unit.level} {cls.name}
        </div>
        <HpBar hp={unit.hp} maxHp={unit.stats.hp} compact />
        <div className="unit-card__stats">
          <span>ATK {unit.stats.atk}</span>
          <span>DEF {unit.stats.def}</span>
          <span>SPD {unit.stats.spd}</span>
        </div>
      </div>
    </button>
  )
}
