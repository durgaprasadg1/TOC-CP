import React from 'react'

export default function GraphStats({ automata, type }) {
  if (!automata) return null

  const { states = [], transitions = [], alphabet = [] } = automata
  const acceptCount  = states.filter(s => s.isAccept).length
  const epsilonCount = type === 'nfa'
    ? transitions.filter(t => !t.symbol || t.symbol === 'ε').length
    : 0

  const stats = [
    { label: 'States',       value: states.length,       color: 'text-lab-text' },
    { label: 'Accept',       value: acceptCount,          color: 'text-lab-orange' },
    { label: 'Transitions',  value: transitions.length,   color: 'text-lab-text' },
    { label: 'Alphabet',     value: alphabet.length,      color: 'text-lab-cyan' },
    ...(type === 'nfa' ? [{ label: 'ε-moves', value: epsilonCount, color: 'text-lab-purple' }] : []),
  ]

  return (
    <div className="absolute top-3 right-3 z-10 flex gap-2">
      {stats.map(s => (
        <div key={s.label} className="lab-panel px-2.5 py-1.5 text-center min-w-[52px]">
          <div className={`text-sm font-mono font-bold ${s.color}`}>{s.value}</div>
          <div className="text-[9px] text-lab-dim uppercase tracking-wider mt-0.5">{s.label}</div>
        </div>
      ))}
    </div>
  )
}
