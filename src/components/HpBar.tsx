interface Props {
  hp: number
  maxHp: number
  compact?: boolean
}

export function HpBar({ hp, maxHp, compact }: Props) {
  const pct = Math.max(0, Math.min(100, (hp / maxHp) * 100))
  const tone = pct > 50 ? 'ok' : pct > 25 ? 'warn' : 'crit'
  return (
    <div className={`hp-bar ${compact ? 'hp-bar--compact' : ''}`}>
      <div className={`hp-bar__fill hp-bar__fill--${tone}`} style={{ width: `${pct}%` }} />
      {!compact && (
        <span className="hp-bar__label">
          {hp}/{maxHp}
        </span>
      )}
    </div>
  )
}
