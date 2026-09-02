import React from 'react'

export default function GraphLegend({ type = 'nfa' }) {
  const items = [
    { color: 'border-lab-muted bg-lab-panel text-lab-dim',      label: 'State' },
    { color: 'border-lab-green bg-lab-green/10 text-lab-green', label: 'Active' },
    { color: 'border-lab-orange bg-transparent text-lab-orange',label: 'Accept', double: true },
    { color: 'border-lab-green/50 text-lab-green/80',           label: 'Start', arrow: true },
    ...(type === 'nfa' ? [
      { epsilon: true, label: 'ε-transition' },
    ] : [])
  ]

  return (
    <div className="absolute bottom-3 left-3 z-10 lab-panel p-3 space-y-2 text-[10px] font-mono">
      <div className="text-lab-dim uppercase tracking-widest text-[9px] mb-2">Legend</div>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2.5 text-lab-dim">
          {item.epsilon ? (
            <div className="flex items-center gap-1">
              <div className="w-6 border-t border-dashed border-lab-purple/60" />
              <div className="w-0 h-0" style={{ borderTop:'3px solid transparent', borderBottom:'3px solid transparent', borderLeft:'5px solid rgba(168,85,247,0.6)' }} />
            </div>
          ) : item.arrow ? (
            <div className="flex items-center gap-1">
              <div className="w-3 border-t border-dashed border-lab-green/50" />
              <div className="w-0 h-0" style={{ borderTop:'3px solid transparent', borderBottom:'3px solid transparent', borderLeft:'5px solid rgba(0,255,157,0.5)' }} />
            </div>
          ) : (
            <div className={`relative w-5 h-5 rounded-full border-2 flex items-center justify-center ${item.color}`}>
              {item.double && <div className="absolute inset-0 rounded-full border border-lab-orange/40" style={{ margin: -4 }} />}
            </div>
          )}
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  )
}
