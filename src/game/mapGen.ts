import type { MapNode, NodeType, RunMap } from './types'

const ROWS = 6
const COLS = 3

function pickType(row: number, rows: number): NodeType {
  if (row === rows - 1) return 'boss'
  if (row === 0) return 'battle'
  const roll = Math.random()
  if (roll < 0.32) return 'battle'
  if (roll < 0.47) return 'elite'
  if (roll < 0.62) return 'recruit'
  if (roll < 0.77) return 'shop'
  if (roll < 0.9) return 'rest'
  return 'event'
}

/**
 * Generates a Slay-the-Spire-style branching path: a grid of rows/cols where
 * each node connects to one or two nodes in the row above, guaranteeing every
 * node is reachable and the top boss node is reachable from every path.
 */
export function generateRunMap(act: number): RunMap {
  const rowsNodes: MapNode[][] = []

  for (let row = 0; row < ROWS; row++) {
    const isBossRow = row === ROWS - 1
    const colCount = isBossRow ? 1 : COLS
    const nodes: MapNode[] = []
    for (let col = 0; col < colCount; col++) {
      nodes.push({
        id: `a${act}-r${row}-c${col}`,
        act,
        row,
        col,
        type: isBossRow ? 'boss' : pickType(row, ROWS),
        connectsTo: [],
        cleared: false,
      })
    }
    rowsNodes.push(nodes)
  }

  // Connect each node in row r to 1-2 nodes in row r+1, keeping edges from
  // crossing too wildly so the map reads as a legible braid.
  for (let row = 0; row < ROWS - 1; row++) {
    const current = rowsNodes[row]
    const next = rowsNodes[row + 1]
    for (const node of current) {
      const isBossRow = next.length === 1
      if (isBossRow) {
        node.connectsTo.push(next[0].id)
        continue
      }
      const targetCol = node.col
      const candidates = [targetCol - 1, targetCol, targetCol + 1].filter(
        (c) => c >= 0 && c < next.length,
      )
      const primary = candidates[Math.floor(Math.random() * candidates.length)]
      node.connectsTo.push(next[primary].id)
      if (Math.random() < 0.35 && candidates.length > 1) {
        const other = candidates.find((c) => c !== primary)
        if (other !== undefined) node.connectsTo.push(next[other].id)
      }
    }
    // Ensure every node in the next row has at least one incoming edge.
    for (let col = 0; col < next.length; col++) {
      const hasIncoming = current.some((n) => n.connectsTo.includes(next[col].id))
      if (!hasIncoming) {
        const closest = current.reduce((best, n) =>
          Math.abs(n.col - col) < Math.abs(best.col - col) ? n : best,
        )
        closest.connectsTo.push(next[col].id)
      }
    }
  }

  return { act, nodes: rowsNodes.flat(), rows: ROWS }
}

export function startingNodes(map: RunMap): MapNode[] {
  return map.nodes.filter((n) => n.row === 0)
}
