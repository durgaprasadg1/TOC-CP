import React, { useEffect, useRef } from 'react'
import { Play, Pause, SkipBack, SkipForward, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { useSimulationStore } from '../../store/useSimulationStore'

export default function SimulationControls() {
  const { steps, currentStep, isPlaying, speed, setPlaying, setSpeed, stepForward, stepBack, reset, setCurrentStep } = useSimulationStore()
  const intervalRef = useRef(null)

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        const { currentStep, steps } = useSimulationStore.getState()
        if (currentStep >= steps.length - 1) {
          setPlaying(false)
        } else {
          stepForward()
        }
      }, speed)
    }
    return () => clearInterval(intervalRef.current)
  }, [isPlaying, speed])

  if (!steps.length) return null

  const progress = steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0
  const current = steps[currentStep]

  return (
    <div className="lab-panel animate-fade-in">
      <div className="lab-panel-header">
        <span className="text-[10px] font-mono text-lab-dim uppercase tracking-widest">Simulation</span>
        <span className="ml-auto text-[10px] font-mono text-lab-dim">
          {currentStep + 1} / {steps.length}
        </span>
      </div>

      <div className="p-4 space-y-3">
        {/* Progress bar */}
        <div className="h-1 bg-lab-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-lab-green rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, boxShadow: '0 0 8px #00ff9d' }}
          />
        </div>

        {/* Current step info */}
        {current && (
          <div className="rounded bg-lab-bg border border-lab-border px-3 py-2 animate-fade-in">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] text-lab-dim">STEP {currentStep + 1}</span>
              <span className={`lab-badge text-[10px] ${current.accepted ? 'bg-lab-green/10 text-lab-green border border-lab-green/20' : current.dead ? 'bg-lab-red/10 text-lab-red border border-lab-red/20' : 'bg-lab-cyan/10 text-lab-cyan border border-lab-cyan/20'}`}>
                {current.accepted ? 'ACCEPTED' : current.dead ? 'DEAD' : 'ACTIVE'}
              </span>
            </div>
            <div className="font-mono text-xs text-lab-text">
              <span className="text-lab-dim">States: </span>
              <span className="text-lab-cyan">{'{' + (current.states || []).join(', ') + '}'}</span>
            </div>
            {current.char !== undefined && (
              <div className="font-mono text-xs text-lab-text mt-0.5">
                <span className="text-lab-dim">Reading: </span>
                <span className="text-lab-orange">'{current.char}'</span>
              </div>
            )}
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-1">
          <button onClick={() => setCurrentStep(0)} className="lab-btn-ghost p-1.5" title="First step">
            <ChevronsLeft size={13} />
          </button>
          <button onClick={stepBack} disabled={currentStep <= 0} className="lab-btn-ghost p-1.5 disabled:opacity-30" title="Previous">
            <SkipBack size={13} />
          </button>
          <button
            onClick={() => setPlaying(!isPlaying)}
            className="lab-btn-primary px-4 py-1.5"
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
          </button>
          <button onClick={stepForward} disabled={currentStep >= steps.length - 1} className="lab-btn-ghost p-1.5 disabled:opacity-30" title="Next">
            <SkipForward size={13} />
          </button>
          <button onClick={() => setCurrentStep(steps.length - 1)} className="lab-btn-ghost p-1.5" title="Last step">
            <ChevronsRight size={13} />
          </button>
        </div>

        {/* Speed */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-lab-dim font-mono">SPEED</span>
          <input
            type="range" min={100} max={1500} step={100}
            value={speed}
            onChange={e => setSpeed(Number(e.target.value))}
            className="flex-1 accent-lab-green h-1"
          />
          <span className="text-[10px] text-lab-green font-mono w-10 text-right">{speed}ms</span>
        </div>
      </div>
    </div>
  )
}
