/**
 * graphTransform.js
 * Converts backend NFA/DFA data into React Flow nodes and edges.
 * Applies a left-to-right layered layout.
 */

// Assign x positions by doing a BFS from start state, grouping into layers
function computeLayers(states, transitions) {
  const startState = states.find(s => s.isStart)
  if (!startState) return {}

  const layers = {}
  const visited = new Set()
  const queue = [{ id: startState.id, layer: 0 }]

  while (queue.length) {
    const { id, layer } = queue.shift()
    if (visited.has(id)) continue
    visited.add(id)
    if (layers[layer] == null) layers[layer] = []
    layers[layer].push(id)

    const outgoing = transitions.filter(t => t.from === id)
    for (const t of outgoing) {
      if (!visited.has(t.to)) {
        queue.push({ id: t.to, layer: layer + 1 })
      }
    }
  }

  // Any states not reachable from start — add at end
  for (const s of states) {
    if (!visited.has(s.id)) {
      const maxLayer = Math.max(0, ...Object.keys(layers).map(Number))
      if (!layers[maxLayer + 1]) layers[maxLayer + 1] = []
      layers[maxLayer + 1].push(s.id)
    }
  }

  return layers
}

const NODE_W = 80
const NODE_H = 80
const H_GAP = 140  // horizontal gap between layers
const V_GAP = 110  // vertical gap between nodes in same layer

export function transformToFlow(automata, activeStates = [], type = 'nfa') {
  if (!automata) return { nodes: [], edges: [] }

  const { states = [], transitions = [] } = automata
  const layers = computeLayers(states, transitions)

  // Build position map
  const posMap = {}
  for (const [layerIdx, stateIds] of Object.entries(layers)) {
    const x = Number(layerIdx) * (NODE_W + H_GAP) + 60
    const totalH = stateIds.length * NODE_H + (stateIds.length - 1) * (V_GAP - NODE_H)
    const startY = -totalH / 2
    stateIds.forEach((id, i) => {
      posMap[id] = {
        x,
        y: startY + i * V_GAP,
      }
    })
  }

  // Build nodes
  const nodes = states.map(state => ({
    id: String(state.id),
    type: 'stateNode',
    position: posMap[state.id] || { x: 0, y: 0 },
    data: {
      label: state.label || String(state.id),
      isStart: state.isStart,
      isAccept: state.isAccept,
      isActive: activeStates.includes(state.id),
      isDead: false,
      automataType: type,
    },
  }))

  // Group parallel transitions (same from/to, different symbols) into one edge
  const edgeMap = {}
  for (const t of transitions) {
    const key = `${t.from}__${t.to}`
    if (!edgeMap[key]) edgeMap[key] = { from: t.from, to: t.to, symbols: [] }
    edgeMap[key].symbols.push(t.symbol ?? 'ε')
  }

  // Build edges
  const edges = Object.entries(edgeMap).map(([key, { from, to, symbols }]) => {
    const isSelf = from === to
    const label = symbols.join(', ')
    const isEpsilon = symbols.every(s => s === 'ε' || s === '')
    const hasActive = activeStates.includes(from) || activeStates.includes(to)

    return {
      id: `e-${key}`,
      source: String(from),
      target: String(to),
      type: isSelf ? 'selfConnecting' : 'transitionEdge',
      label,
      animated: hasActive,
      data: {
        label,
        isEpsilon,
        isActive: hasActive,
        symbols,
      },
      style: {
        stroke: isEpsilon
          ? 'rgba(168, 85, 247, 0.6)'   // purple for ε
          : hasActive
            ? '#00ff9d'                  // green when active
            : 'rgba(90, 99, 128, 0.5)',  // dim otherwise
        strokeWidth: hasActive ? 2 : 1.5,
      },
      labelStyle: {
        fill: isEpsilon ? '#a855f7' : hasActive ? '#00ff9d' : '#5a6380',
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 11,
      },
      labelBgStyle: { fill: '#0f1117', fillOpacity: 0.85 },
      markerEnd: {
        type: 'arrowclosed',
        color: isEpsilon
          ? 'rgba(168,85,247,0.6)'
          : hasActive ? '#00ff9d' : 'rgba(90,99,128,0.5)',
      },
    }
  })

  return { nodes, edges }
}
