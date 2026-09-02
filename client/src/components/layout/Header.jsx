import React from 'react'
import { FlaskConical, Github, BookOpen } from 'lucide-react'

export default function Header() {
  return (
    <header className="flex items-center justify-between px-5 py-3 border-b border-lab-border bg-lab-surface shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-lab-green/10 border border-lab-green/20">
          <FlaskConical size={16} className="text-lab-green" />
        </div>
        <div>
          <span className="font-display text-sm font-bold text-lab-text tracking-wide">
            Regex<span className="text-lab-green">Lab</span>
          </span>
          <span className="ml-2 text-[10px] text-lab-dim font-mono">v1.0.0</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 ml-4 px-2.5 py-1 rounded bg-lab-green/5 border border-lab-green/10">
          <div className="glow-dot" />
          <span className="text-[10px] font-mono text-lab-green/70">ENGINE READY</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex items-center gap-1">
        <a
          href="https://en.wikipedia.org/wiki/Thompson%27s_construction"
          target="_blank"
          rel="noreferrer"
          className="lab-btn-ghost flex items-center gap-1.5"
        >
          <BookOpen size={12} />
          <span className="hidden sm:inline">Docs</span>
        </a>
        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="lab-btn-ghost flex items-center gap-1.5"
        >
          <Github size={12} />
          <span className="hidden sm:inline">GitHub</span>
        </a>
      </nav>
    </header>
  )
}
