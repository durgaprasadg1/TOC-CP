import React, { useMemo } from 'react'
import { Search, Zap } from 'lucide-react'
import { useRegexStore } from '../../store/useRegexStore'
import { useRegexEngine } from '../../hooks/useRegexEngine'

export default function TestStringInput() {
  const { testString, matchResults, pattern, isLoading, setTestString } = useRegexStore()
  const { simulate } = useRegexEngine()

  // Build highlighted segments
  const segments = useMemo(() => {
    if (!matchResults?.length || !testString) return null
    const sorted = [...matchResults].sort((a, b) => a.start - b.start)
    const parts = []
    let cursor = 0
    for (const m of sorted) {
      if (m.start > cursor) parts.push({ text: testString.slice(cursor, m.start), match: false })
      parts.push({ text: testString.slice(m.start, m.end), match: true })
      cursor = m.end
    }
    if (cursor < testString.length) parts.push({ text: testString.slice(cursor), match: false })
    return parts
  }, [matchResults, testString])

  return (
    <div className="lab-panel animate-fade-in">
      <div className="lab-panel-header">
        <span className="text-[10px] font-mono text-lab-dim uppercase tracking-widest">Test String</span>
        {matchResults && (
          <div className="ml-auto flex items-center gap-2">
            <span className={`lab-badge ${matchResults.length > 0 ? 'bg-lab-green/10 text-lab-green border border-lab-green/20' : 'bg-lab-red/10 text-lab-red border border-lab-red/20'}`}>
              {matchResults.length > 0 ? `${matchResults.length} match${matchResults.length > 1 ? 'es' : ''}` : 'no match'}
            </span>
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <textarea
          value={testString}
          onChange={e => setTestString(e.target.value)}
          placeholder="Enter string to test against the regex…"
          rows={3}
          spellCheck={false}
          className="
            w-full bg-lab-bg border border-lab-border rounded px-3 py-2.5
            font-mono text-sm text-lab-text placeholder-lab-dim/40 resize-none
            focus:outline-none focus:border-lab-cyan/50 transition-colors caret-lab-cyan
          "
        />

        {/* Highlighted preview */}
        {segments && (
          <div className="rounded bg-lab-bg border border-lab-border px-3 py-2.5 font-mono text-sm leading-relaxed break-all">
            {segments.map((seg, i) =>
              seg.match ? (
                <mark key={i} className="bg-lab-green/20 text-lab-green border-b border-lab-green/60 rounded-sm px-0.5">
                  {seg.text}
                </mark>
              ) : (
                <span key={i} className="text-lab-dim">{seg.text}</span>
              )
            )}
          </div>
        )}

        <button
          onClick={simulate}
          disabled={!pattern.trim() || !testString || isLoading}
          className="lab-btn bg-lab-cyan/10 border-lab-cyan/30 text-lab-cyan hover:bg-lab-cyan/20 hover:border-lab-cyan/50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Zap size={11} />
          {isLoading ? 'Simulating…' : 'Run Simulation'}
        </button>
      </div>
    </div>
  )
}
