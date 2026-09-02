import React, { useState } from 'react'
import { Play, RotateCcw, AlertCircle, ChevronDown } from 'lucide-react'
import { useRegexStore } from '../../store/useRegexStore'
import { useRegexEngine } from '../../hooks/useRegexEngine'
import { EXAMPLE_REGEXES } from '../../constants/exampleRegexes'

export default function RegexInput() {
  const { pattern, flags, error, isLoading, isDirty, setPattern, setFlags, reset } = useRegexStore()
  const { buildAutomata } = useRegexEngine()
  const [showExamples, setShowExamples] = useState(false)

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') buildAutomata()
  }

  const applyExample = (ex) => {
    setPattern(ex.pattern)
    useRegexStore.getState().setTestString(ex.test)
    setShowExamples(false)
  }

  const FLAG_OPTS = [
    { key: 'global', label: 'g', title: 'Global' },
    { key: 'ignoreCase', label: 'i', title: 'Ignore Case' },
    { key: 'multiline', label: 'm', title: 'Multiline' },
  ]

  return (
    <div className="lab-panel animate-fade-in">
      <div className="lab-panel-header">
        <span className="text-[10px] font-mono text-lab-dim uppercase tracking-widest">Pattern</span>
        <div className="ml-auto flex items-center gap-1">
          {FLAG_OPTS.map(f => (
            <button
              key={f.key}
              title={f.title}
              onClick={() => setFlags({ [f.key]: !flags[f.key] })}
              className={`px-2 py-0.5 rounded text-xs font-mono border transition-all ${
                flags[f.key]
                  ? 'bg-lab-cyan/10 border-lab-cyan/30 text-lab-cyan'
                  : 'bg-transparent border-lab-border text-lab-dim hover:border-lab-muted'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Input row */}
        <div className="flex items-center gap-2 group">
          <div className="flex items-center gap-1 text-lab-dim font-mono text-lg select-none">/</div>
          <input
            type="text"
            value={pattern}
            onChange={e => setPattern(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter regular expression…"
            spellCheck={false}
            className="
              flex-1 bg-lab-bg border border-lab-border rounded px-3 py-2.5
              font-mono text-sm text-lab-text placeholder-lab-dim/40
              focus:outline-none focus:border-lab-green/50 focus:bg-lab-bg
              transition-colors caret-lab-green
            "
          />
          <div className="flex items-center gap-1 text-lab-dim font-mono text-lg select-none">
            /{Object.entries(flags).filter(([, v]) => v).map(([k]) => ({ global:'g', ignoreCase:'i', multiline:'m' }[k])).join('')}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-3 py-2 rounded bg-lab-red/10 border border-lab-red/20 animate-fade-in">
            <AlertCircle size={12} className="text-lab-red shrink-0" />
            <span className="text-xs text-lab-red font-mono">{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={buildAutomata}
            disabled={!pattern.trim() || isLoading}
            className="lab-btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Play size={11} />
            {isLoading ? 'Building…' : isDirty ? 'Build Automata*' : 'Build Automata'}
          </button>

          <button onClick={reset} className="lab-btn-ghost">
            <RotateCcw size={11} /> Reset
          </button>

          <div className="relative ml-auto">
            <button
              onClick={() => setShowExamples(v => !v)}
              className="lab-btn-ghost"
            >
              Examples <ChevronDown size={10} className={`transition-transform ${showExamples ? 'rotate-180' : ''}`} />
            </button>

            {showExamples && (
              <div className="absolute right-0 top-full mt-1 w-72 lab-panel z-50 shadow-2xl animate-slide-up overflow-hidden">
                {EXAMPLE_REGEXES.map(group => (
                  <div key={group.category}>
                    <div className="px-3 py-1.5 bg-lab-bg border-b border-lab-border">
                      <span className="text-[10px] font-mono text-lab-dim uppercase tracking-widest">{group.category}</span>
                    </div>
                    {group.examples.map(ex => (
                      <button
                        key={ex.label}
                        onClick={() => applyExample(ex)}
                        className="w-full text-left px-3 py-2 hover:bg-lab-muted/30 transition-colors border-b border-lab-border/50"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-lab-dim">{ex.label}</span>
                          <code className="text-xs text-lab-green font-mono">/{ex.pattern}/</code>
                        </div>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
