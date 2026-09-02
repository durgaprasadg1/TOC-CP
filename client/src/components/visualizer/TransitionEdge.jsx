import React, { memo } from 'react'
import { getBezierPath, EdgeLabelRenderer, BaseEdge } from 'reactflow'

/**
 * TransitionEdge – curved labeled edge between two different states.
 */
function TransitionEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition,
  data, style = {}, markerEnd, labelStyle, labelBgStyle,
}) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
    curvature: 0.25,
  })

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={style} markerEnd={markerEnd} />

      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <div
              className="px-1.5 py-0.5 rounded text-[10px] font-mono border"
              style={{
                background: '#0f1117',
                color: data.isEpsilon
                  ? '#a855f7'
                  : data.isActive ? '#00ff9d' : '#5a6380',
                borderColor: data.isEpsilon
                  ? 'rgba(168,85,247,0.25)'
                  : data.isActive ? 'rgba(0,255,157,0.25)' : 'rgba(30,35,48,0.8)',
              }}
            >
              {data.label}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}

export default memo(TransitionEdge)
