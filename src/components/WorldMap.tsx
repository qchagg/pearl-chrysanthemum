import { useMemo } from 'react'
import { useRunStore } from '../store/runStore'
import type { MapNode, NodeType } from '../game/types'

const NODE_LABEL: Record<NodeType, string> = {
  battle: 'Skirmish',
  elite: 'Elite',
  recruit: 'Recruit',
  shop: 'Shop',
  rest: 'Rest',
  event: 'Event',
  boss: 'Boss',
}

const NODE_ICON: Record<NodeType, string> = {
  battle: '⚔',
  elite: '⚔⚔',
  recruit: '★',
  shop: '⛨',
  rest: '⛺',
  event: '?',
  boss: '☠',
}

export function WorldMap() {
  const map = useRunStore((s) => s.map)
  const act = useRunStore((s) => s.act)
  const currentNodeId = useRunStore((s) => s.currentNodeId)
  const enterNode = useRunStore((s) => s.enterNode)
  const reachableNodeIdsFn = useRunStore((s) => s.reachableNodeIds)
  // eslint-disable-next-line react-hooks/exhaustive-deps -- map/currentNodeId drive reachableNodeIdsFn's closure over store state
  const reachableNodeIds = useMemo(() => reachableNodeIdsFn(), [map, currentNodeId, reachableNodeIdsFn])
  const gold = useRunStore((s) => s.gold)
  const potions = useRunStore((s) => s.potions)
  const roster = useRunStore((s) => s.roster)
  const notice = useRunStore((s) => s.notice)
  const clearNotice = useRunStore((s) => s.clearNotice)

  if (!map) return null

  const rows: MapNode[][] = []
  for (let r = 0; r < map.rows; r++) rows.push(map.nodes.filter((n) => n.row === r))

  return (
    <div className="screen">
      <div className="screen-header">
        <h1>Act {act}</h1>
        <div className="pill-row">
          <div className="pill pill--gold">{gold} Gold</div>
          <div className="pill">{potions} Potions</div>
          <div className="pill">{roster.length} Units</div>
        </div>
      </div>

      {notice && (
        <div className="notice-banner" onClick={clearNotice}>
          <strong>{notice.title}</strong>
          {notice.lines.map((l, i) => (
            <span key={i}>{l}</span>
          ))}
          <span className="notice-banner__dismiss">tap to dismiss</span>
        </div>
      )}

      <div className="map-board">
        {[...rows].reverse().map((row, ri) => (
          <div className="map-row" key={ri}>
            {row.map((node) => {
              const reachable = reachableNodeIds.has(node.id)
              const isCurrent = node.id === currentNodeId
              return (
                <button
                  key={node.id}
                  type="button"
                  className={[
                    'map-node',
                    `map-node--${node.type}`,
                    node.cleared ? 'map-node--cleared' : '',
                    reachable ? 'map-node--reachable' : '',
                    isCurrent ? 'map-node--current' : '',
                  ].join(' ')}
                  disabled={!reachable}
                  onClick={() => enterNode(node.id)}
                  title={NODE_LABEL[node.type]}
                >
                  <span className="map-node__icon">{NODE_ICON[node.type]}</span>
                  <span className="map-node__label">{NODE_LABEL[node.type]}</span>
                </button>
              )
            })}
          </div>
        ))}
      </div>

      <div className="roster-strip">
        {roster.map((u) => (
          <div key={u.instanceId} className="roster-chip">
            <span>{u.name}</span>
            <span className="roster-chip__hp">
              {u.hp}/{u.stats.hp} HP
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
