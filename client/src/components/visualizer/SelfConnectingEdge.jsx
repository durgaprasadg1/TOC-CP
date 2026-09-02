import React, { memo } from 'react'
import { EdgeLabelRenderer, useStore } from 'reactflow'

/**
 * SelfConnectingEdge – renders a loop arc above a state node for self-transitions.
 */
function SelfConnectingEdge({ id, source, data, style = {}, markerEnd }) {
  const sourceNode = useStore(s => s.nodeInternals.get(source))
  if (!sourceNode) return null

  const x = (sourceNode.positionAbsolute?.x ?? sourceNode.position.x)
  const y = (sourceNode.positionAbsolute?.y ?? sourceNode.position.y)
  const w = sourceNode.width  || 64
  const h = sourceNode.height || 64
  const cx = x + w / 2
  const cy = y + h / 2

  const loopR = 28
  const sx = cx - 14
  const sy = cy - h / 2
  const ex = cx + 14
  const ey = cy - h / 2

  const pathD = `M ${sx} ${sy} C ${sx} ${sy - loopR * 2} ${ex} ${ey - loopR * 2} ${ex} ${ey}`
  const labelX = cx
  const labelY = cy - h / 2 - loopR * 2 - 4

  const color = data?.isEpsilon
    ? '#a855f7'
    : data?.isActive ? '#00ff9d' : '#5a6380'
  const borderColor = data?.isEpsilon
    ? 'rgba(168,85,247,0.25)'
    : data?.isActive ? 'rgba(0,255,157,0.25)' : 'rgba(30,35,48,0.8)'

  return (
    <>
      <path id={id} d={pathD} fill="none" style={style} markerEnd={markerEnd} />
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -100%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <div
              className="px-1.5 py-0.5 rounded text-[10px] font-mono border"
              style={{ background: '#0f1117', color, borderColor }}
            >
              {data.label}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}

export default memo(SelfConnectingEdge)
