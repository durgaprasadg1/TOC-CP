'use strict'

/**
 * nfaToDfa.js  — Subset construction (Rabin-Scott powerset construction)
 * Converts an NFA (with ε-transitions) into an equivalent DFA.
 */

const { ANY_SYMBOL } = require('./thompson')

// ── ε-closure ─────────────────────────────────────────────────────────────────
// Returns the set of all NFA states reachable from a set of states via ε only.
function epsilonClosure(states) {
  const closure = new Set(states)
  const stack   = [...states]

  while (stack.length) {
    const s = stack.pop()
    const epsilonTargets = s.transitions.get('') || new Set()
    for (const t of epsilonTargets) {
      if (!closure.has(t)) {
        closure.add(t)
        stack.push(t)
      }
    }
  }
  return closure
}

// ── move ──────────────────────────────────────────────────────────────────────
// Returns the set of NFA states reachable from `states` on input `symbol`.
function move(states, symbol) {
  const result = new Set()
  for (const s of states) {
    // Normal symbol transitions
    const targets = s.transitions.get(symbol) || new Set()
    for (const t of targets) result.add(t)

    // ANY_SYMBOL transitions match any single character
    if (symbol !== '' && symbol !== ANY_SYMBOL) {
      const anyTargets = s.transitions.get(ANY_SYMBOL) || new Set()
      for (const t of anyTargets) result.add(t)
    }

    // CharClass transitions
    for (const [key, targets2] of s.transitions) {
      if (typeof key === 'object' && key !== null && key.type === 'class') {
        const matches = key.negate
          ? !key.chars.has(symbol)
          : key.chars.has(symbol)
        if (matches && symbol !== '') {
          for (const t of targets2) result.add(t)
        }
      }
    }
  }
  return result
}

// ── DFA State ─────────────────────────────────────────────────────────────────
class DFAState {
  constructor(id, nfaStates, isAccept) {
    this.id          = id
    this.nfaStates   = nfaStates   // Set of NFA State objects
    this.isAccept    = isAccept
    this.transitions = new Map()   // symbol → DFAState
  }
}

// ── Subset Construction ───────────────────────────────────────────────────────
function convert(nfa) {
  const { start, accept, alphabet } = nfa

  // Collect all symbols including those used by charClass transitions
  const allSymbols = new Set(alphabet)

  // Add char-class chars to alphabet for DFA construction
  for (const [,state] of nfa.states) {
    for (const [key] of state.transitions) {
      if (typeof key === 'object' && key !== null && key.type === 'class') {
        for (const c of key.chars) allSymbols.add(c)
      }
    }
  }

  const dfaStates  = new Map()   // setKey → DFAState
  const unmarked   = []
  let   counter    = 0

  function setKey(stateSet) {
    return [...stateSet].map(s => s.id).sort((a, b) => a - b).join(',')
  }

  function getOrCreate(nfaStateSet) {
    const key      = setKey(nfaStateSet)
    if (dfaStates.has(key)) return dfaStates.get(key)
    const isAccept = [...nfaStateSet].some(s => s.id === accept.id)
    const dState   = new DFAState(counter++, nfaStateSet, isAccept)
    dfaStates.set(key, dState)
    unmarked.push(dState)
    return dState
  }

  // Start: ε-closure of NFA start
  const startClosure = epsilonClosure(new Set([start]))
  const dfaStart     = getOrCreate(startClosure)

  while (unmarked.length) {
    const current = unmarked.pop()

    for (const sym of allSymbols) {
      const moved   = move(current.nfaStates, sym)
      if (moved.size === 0) continue
      const closed  = epsilonClosure(moved)
      const target  = getOrCreate(closed)
      current.transitions.set(sym, target)
    }
  }

  // Build final DFA structure
  const states = new Map()
  for (const [, ds] of dfaStates) states.set(ds.id, ds)

  return {
    start:    dfaStart,
    states,
    alphabet: allSymbols,
  }
}

module.exports = { convert, epsilonClosure, move }
