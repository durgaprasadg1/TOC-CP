import React, { useState } from 'react'
import { Table2 } from 'lucide-react'
import { useRegexStore } from '../../store/useRegexStore'

export default function TransitionTable() {
  const { nfa, dfa, activeTab } = useRegexStore()
  const automata = activeTab === 'nfa' ? nfa : dfa

  if (!automata) return null

  const { states = [], transitions = [], alphabet = [] } = automata

  // Build lookup: state -> symbol -> [targets]
  const table = {}
  for (const s of states) {
    table[s.id] = {}
    for (const sym of [...alphabet, 'ε']) table[s.id][sym] = []
  }
  for (const t of transitions) {
    const sym = t.symbol || 'ε'
    if (table[t.from]) {
      table[t.from][sym] = [...(table[t.from][sym] || []), t.to]
    }
  }

  const symbols = activeTab === 'nfa' ? [...alphabet, 'ε'] : alphabet

  return (
    <div className="lab-panel animate-fade-in">
      <div className="lab-panel-header">
        <Table2 size={12} className="text-lab-dim" />
        <span className="text-[10px] font-mono text-lab-dim uppercase tracking-widest">
          Transition Table — {activeTab.toUpperCase()}
        </span>
        <span className="ml-auto lab-badge bg-lab-muted/30 text-lab-dim border border-lab-border text-[10px]">
          {states.length} states
        </span>
      </div>

      <div className="overflow-auto max-h-52">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-lab-border">
              <th className="px-3 py-2 text-left text-lab-dim font-normal text-[10px] uppercase tracking-wider bg-lab-bg sticky left-0">State</th>
              {symbols.map(sym => (
                <th key={sym} className="px-3 py-2 text-center text-lab-cyan font-normal">
                  {sym === 'ε' ? <span className="text-lab-purple">ε</span> : sym}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {states.map(state => (
              <tr key={state.id} className="border-b border-lab-border/50 hover:bg-lab-muted/10 transition-colors">
                <td className="px-3 py-1.5 sticky left-0 bg-lab-panel">
                  <div className="flex items-center gap-1.5">
                    {state.isStart && <span className="text-lab-green text-[10px]">→</span>}
                    {state.isAccept && <span className="text-lab-orange text-[10px]">★</span>}
                    <span className={state.isAccept ? 'text-lab-orange' : state.isStart ? 'text-lab-green' : 'text-lab-text'}>
                      {state.label || state.id}
                    </span>
                  </div>
                </td>
                {symbols.map(sym => {
                  const targets = table[state.id]?.[sym] || []
                  return (
                    <td key={sym} className="px-3 py-1.5 text-center text-lab-dim">
                      {targets.length > 0
                        ? <span className="text-lab-text">{targets.length > 1 ? `{${targets.join(',')}}` : targets[0]}</span>
                        : <span className="text-lab-border">—</span>
                      }
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-3 py-1.5 border-t border-lab-border flex gap-4 text-[10px] font-mono text-lab-dim">
        <span><span className="text-lab-green">→</span> start</span>
        <span><span className="text-lab-orange">★</span> accept</span>
        {activeTab === 'nfa' && <span><span className="text-lab-purple">ε</span> epsilon</span>}
      </div>
    </div>
  )
}
