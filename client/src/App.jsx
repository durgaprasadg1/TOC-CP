import React from 'react'
import Header from './components/layout/Header.jsx'
import RegexInput from './components/editor/RegexInput.jsx'
import TestStringInput from './components/editor/TestStringInput.jsx'
import AutomataGraph from './components/visualizer/AutomataGraph.jsx'
import SimulationControls from './components/simulation/SimulationControls.jsx'
import TransitionTable from './components/panels/TransitionTable.jsx'
import { useRegexStore } from './store/useRegexStore.js'

function TabBar() {
  const { activeTab, setActiveTab, nfa, dfa } = useRegexStore()
  return (
    <div className="flex items-center gap-1 px-4 pt-3">
      {[
        { id: 'nfa', label: 'NFA', color: 'green', count: nfa?.states?.length },
        { id: 'dfa', label: 'DFA', color: 'cyan',  count: dfa?.states?.length },
      ].map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-t text-xs font-mono border-t border-l border-r transition-all ${
            activeTab === tab.id
              ? 'bg-lab-panel border-lab-border text-lab-text -mb-px z-10'
              : 'bg-transparent border-transparent text-lab-dim hover:text-lab-text'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${tab.id === 'nfa' ? 'bg-lab-green' : 'bg-lab-cyan'} ${tab.count ? 'opacity-100' : 'opacity-30'}`} />
          {tab.label}
          {tab.count != null && (
            <span className="text-[10px] text-lab-dim">({tab.count})</span>
          )}
        </button>
      ))}
    </div>
  )
}

export default function App() {
  return (
    <div className="h-screen flex flex-col bg-lab-bg overflow-hidden">
      <Header />

      <div className="flex-1 flex overflow-hidden p-3 gap-3 min-h-0">
        {/* Left sidebar */}
        <aside className="w-80 flex flex-col gap-3 overflow-y-auto shrink-0">
          <RegexInput />
          <TestStringInput />
          <SimulationControls />
          <TransitionTable />
        </aside>

        {/* Main visualizer area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TabBar />
          <div className="flex-1 min-h-0 border border-lab-border rounded-lg rounded-tl-none overflow-hidden">
            <AutomataGraph />
          </div>
        </main>
      </div>

      {/* Footer status bar */}
      <footer className="flex items-center gap-4 px-4 py-1.5 border-t border-lab-border bg-lab-surface shrink-0">
        <span className="text-[10px] font-mono text-lab-dim">Thompson's Construction  ·  Subset Construction  ·  Hopcroft's Minimization</span>
        <div className="ml-auto flex items-center gap-3 text-[10px] font-mono text-lab-dim">
          <span>NFA</span>
          <span className="text-lab-border">|</span>
          <span>DFA</span>
          <span className="text-lab-border">|</span>
          <span>Step Simulation</span>
        </div>
      </footer>
    </div>
  )
}
