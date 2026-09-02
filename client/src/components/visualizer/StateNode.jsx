import React, { memo } from 'react'
import { Handle, Position } from 'reactflow'

/**
 * StateNode – Renders a single automata state as a circle.
 *
 * Visual encoding:
 *  - Double ring  → accept state
 *  - Arrow prefix → start state
 *  - Green glow   → currently active in simulation
 *  - Red tint     → dead / rejected state
 */
function StateNode({ data }) {
  const { label, isStart, isAccept, isActive, isDead } = data

  // Determine color scheme
  let ringColor    = 'border-lab-muted'
  let textColor    = 'text-lab-dim'
  let bgColor      = 'bg-lab-panel'
  let glowStyle    = {}
  let outerRing    = ''

  if (isActive && !isDead) {
    ringColor  = 'border-lab-green'
    textColor  = 'text-lab-green'
    bgColor    = 'bg-lab-green/10'
    glowStyle  = { boxShadow: '0 0 0 3px rgba(0,255,157,0.15), 0 0 20px rgba(0,255,157,0.2)' }
  } else if (isDead) {
    ringColor  = 'border-lab-red/50'
    textColor  = 'text-lab-red/60'
    bgColor    = 'bg-lab-red/5'
  } else if (isAccept) {
    ringColor  = 'border-lab-orange'
    textColor  = 'text-lab-orange'
    outerRing  = 'border-lab-orange/40'
  } else if (isStart) {
    ringColor  = 'border-lab-green/50'
    textColor  = 'text-lab-green/80'
  }

  return (
    <div className="relative flex items-center justify-center" style={{ width: 64, height: 64 }}>

      {/* Start state arrow */}
      {isStart && (
        <div className="absolute -left-8 top-1/2 -translate-y-1/2 flex items-center">
          <div className="w-5 border-t border-dashed border-lab-green/50" />
          <div
            className="w-0 h-0"
            style={{
              borderTop: '4px solid transparent',
              borderBottom: '4px solid transparent',
              borderLeft: '6px solid rgba(0,255,157,0.5)',
            }}
          />
        </div>
      )}

      {/* Accept state outer ring */}
      {isAccept && (
        <div
          className={`absolute inset-0 rounded-full border-2 ${outerRing || 'border-lab-orange/40'}`}
          style={{ margin: -6 }}
        />
      )}

      {/* Main circle */}
      <div
        className={`
          w-16 h-16 rounded-full border-2 flex items-center justify-center
          font-mono text-xs font-semibold select-none transition-all duration-300
          ${ringColor} ${textColor} ${bgColor}
        `}
        style={glowStyle}
      >
        {label}
      </div>

      {/* Active pulse ring */}
      {isActive && !isDead && (
        <div
          className="absolute inset-0 rounded-full border border-lab-green/30 animate-ping"
          style={{ margin: -4, animationDuration: '1.5s' }}
        />
      )}

      {/* React Flow handles */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: 'transparent', border: 'none', width: 8, height: 8 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: 'transparent', border: 'none', width: 8, height: 8 }}
      />
    </div>
  )
}

export default memo(StateNode)
