import React, { useMemo, useEffect } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  Panel,
} from 'reactflow'
import 'reactflow/dist/style.css'

import { useRegexStore } from '../../store/useRegexStore'
import { useSimulationStore } from '../../store/useSimulationStore'
import { transformToFlow } from '../../utils/graphTransform'
import StateNode from './StateNode'
import TransitionEdge from './TransitionEdge'
import SelfConnectingEdge from './SelfConnectingEdge'
import GraphLegend from './GraphLegend'
import GraphStats from './GraphStats'

const nodeTypes = { stateNode: StateNode }
const edgeTypes = {
  transitionEdge: TransitionEdge,
  selfConnecting: SelfConnectingEdge,
}

function AutomataGraphInner() {
  const { nfa, dfa, activeTab, isLoading, pattern, flags } = useRegexStore()
  const { steps, currentStep } = useSimulationStore()

  const automata = activeTab === 'nfa' ? nfa : dfa

  const activeStates = useMemo(() => {
    if (currentStep < 0 || !steps[currentStep]) return []
    return steps[currentStep].states || []
  }, [steps, currentStep])

  const { initialNodes, initialEdges } = useMemo(() => {
    const { nodes, edges } = transformToFlow(automata, activeStates, activeTab)
    return { initialNodes: nodes, initialEdges: edges }
  }, [automata, activeStates, activeTab])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  useEffect(() => {
    setNodes(initialNodes)
    setEdges(initialEdges)
  }, [initialNodes, initialEdges])

  const flagStr = Object.entries(flags)
    .filter(([, v]) => v)
    .map(([k]) => ({ global: 'g', ignoreCase: 'i', multiline: 'm' }[k]))
    .join('')

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full bg-lab-bg">
        <div className="text-center space-y-4">
          <div className="relative mx-auto w-12 h-12">
            <div className="w-12 h-12 border-2 border-lab-border rounded-full" />
            <div className="absolute inset-0 w-12 h-12 border-2 border-t-lab-green rounded-full animate-spin" />
          </div>
          <div>
            <p className="text-xs text-lab-green font-mono">Constructing automata…</p>
            <p className="text-[10px] text-lab-dim font-mono mt-1">Applying Thompson's construction</p>
          </div>
        </div>
      </div>
    )
  }

  if (!automata) {
    return (
      <div className="flex-1 flex items-center justify-center h-full bg-lab-bg">
        <div className="text-center space-y-5 max-w-sm px-8">
          <div className="flex items-center justify-center gap-3 opacity-30">
            {['q₀', 'q₁', 'q₂'].map((label, i) => (
              <React.Fragment key={label}>
                <div className={`w-10 h-10 rounded-full border flex items-center justify-center text-xs font-mono
                  ${i === 2 ? 'border-lab-orange text-lab-orange border-2' : 'border-lab-muted text-lab-dim'}`}>
                  {label}
                </div>
                {i < 2 && (
                  <div className="flex items-center gap-0.5">
                    <div className="w-4 border-t border-lab-border" />
                    <div className="w-0 h-0" style={{ borderTop:'3px solid transparent', borderBottom:'3px solid transparent', borderLeft:'5px solid rgba(90,99,128,0.4)' }} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
          <div>
            <p className="text-sm font-mono text-lab-dim">No automata to display</p>
            <p className="text-xs text-lab-dim/50 mt-1.5 leading-relaxed">
              Enter a pattern and click <span className="text-lab-green font-mono">Build Automata</span> to generate the {activeTab.toUpperCase()} state machine
            </p>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
            {[['ab','concat'],['a|b','alter'],['a*','Kleene'],['a+','plus'],['(ab)+','group'],['[a-z]','class']].map(([p,d]) => (
              <div key={p} className="flex items-center gap-1.5 px-2 py-1 rounded bg-lab-panel border border-lab-border">
                <code className="text-lab-green">{p}</code>
                <span className="text-lab-dim">{d}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.2}
        maxZoom={2.5}
        proOptions={{ hideAttribution: true }}
        style={{ background: '#0a0c0f' }}
      >
        <Background color="#1e2330" gap={24} size={1} variant="dots" />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(node) => {
            if (node.data?.isActive) return '#00ff9d'
            if (node.data?.isAccept) return '#ff8c42'
            if (node.data?.isStart)  return 'rgba(0,255,157,0.3)'
            return '#1e2330'
          }}
          maskColor="rgba(10,12,15,0.8)"
          style={{ background: '#13161e', border: '1px solid #1e2330' }}
        />
        <GraphLegend type={activeTab} />
        <GraphStats automata={automata} type={activeTab} />
        <Panel position="bottom-center">
          <div className="px-3 py-1 rounded-full bg-lab-panel/80 border border-lab-border">
            <code className="text-xs text-lab-dim font-mono">/{pattern}/{flagStr}</code>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  )
}

export default function AutomataGraph() {
  return (
    <ReactFlowProvider>
      <div className="w-full h-full" style={{ minHeight: 0 }}>
        <AutomataGraphInner />
      </div>
    </ReactFlowProvider>
  )
}
