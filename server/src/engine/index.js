'use strict'

const parser   = require('./parser')
const thompson = require('./thompson')
const nfaToDfa = require('./nfaToDfa')
const simulator = require('./simulator')

function parse(pattern, flags = {}) {
  return parser.parse(pattern, flags)
}

function buildNfa(pattern, flags = {}) {
  const ast = parser.parse(pattern, flags)
  const nfa = thompson.build(ast)
  return serializeNfa(nfa, flags)
}

function buildDfa(pattern, flags = {}) {
  const ast = parser.parse(pattern, flags)
  const nfa = thompson.build(ast)
  const dfa = nfaToDfa.convert(nfa)
  return serializeDfa(dfa, flags)
}

function simulate(pattern, testString, flags = {}) {
  const ast = parser.parse(pattern, flags)
  const nfa = thompson.build(ast)
  return simulator.run(nfa, testString, flags)
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Convert a transition key (string, ANY_SYMBOL, or charClass object) to display label */
function symbolLabel(sym) {
  if (sym === '')                                     return 'ε'
  if (sym === thompson.ANY_SYMBOL)                    return '.'
  if (typeof sym === 'object' && sym.type === 'class')
    return sym.negate ? `[^…]` : `[…]`
  return sym
}

function serializeNfa(nfa) {
  const stateList = [...nfa.states.values()]
  const alphabet  = [...nfa.alphabet]

  const states = stateList.map(s => ({
    id:       s.id,
    label:    `q${s.id}`,
    isStart:  s.id === nfa.start.id,
    isAccept: s.id === nfa.accept.id,
  }))

  const transitions = []
  for (const s of stateList) {
    for (const [sym, targets] of s.transitions) {
      for (const t of targets) {
        transitions.push({
          from:   s.id,
          to:     t.id,
          symbol: symbolLabel(sym),
        })
      }
    }
  }

  return { states, transitions, alphabet, type: 'nfa' }
}

function serializeDfa(dfa) {
  const stateList = [...dfa.states.values()]
  const alphabet  = [...dfa.alphabet].filter(s => typeof s === 'string')

  const states = stateList.map(s => ({
    id:       s.id,
    label:    `D${s.id}`,
    isStart:  s.id === dfa.start.id,
    isAccept: s.isAccept,
  }))

  const transitions = []
  for (const s of stateList) {
    for (const [sym, target] of s.transitions) {
      if (target != null && typeof sym === 'string') {
        transitions.push({ from: s.id, to: target.id, symbol: sym })
      }
    }
  }

  return { states, transitions, alphabet, type: 'dfa' }
}

module.exports = { parse, buildNfa, buildDfa, simulate }
