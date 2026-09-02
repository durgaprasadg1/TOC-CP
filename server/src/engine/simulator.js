'use strict'

/**
 * simulator.js
 * Runs a test string through the NFA and returns:
 *   - matches: [{start, end, text}]  — all non-overlapping matches
 *   - steps:   [{index, char, states, accepted, dead}]  — full trace
 *
 * Uses the "leftmost-longest" greedy strategy via NFA simulation
 * (parallel states / powerset-on-the-fly), scanning the input with
 * a sliding window.
 */

const { epsilonClosure, move } = require('./nfaToDfa')

// ── matchAt ───────────────────────────────────────────────────────────────────
// Try to match starting at position `pos` in `text`.
// Returns { end, steps } on success, null if no match.
function matchAt(nfa, text, pos) {
  let   currentStates = epsilonClosure(new Set([nfa.start]))
  const steps         = []
  let   lastAccept    = -1

  // Record initial state
  steps.push({
    index:    pos,
    char:     null,
    states:   [...currentStates].map(s => s.id),
    accepted: [...currentStates].some(s => s.id === nfa.accept.id),
    dead:     false,
  })

  if ([...currentStates].some(s => s.id === nfa.accept.id)) {
    lastAccept = pos  // can match empty string
  }

  for (let i = pos; i < text.length; i++) {
    const ch      = text[i]
    const moved   = move(currentStates, ch)
    const closed  = epsilonClosure(moved)
    const accepted = [...closed].some(s => s.id === nfa.accept.id)
    const dead     = closed.size === 0

    steps.push({
      index:    i + 1,
      char:     ch,
      states:   [...closed].map(s => s.id),
      accepted,
      dead,
    })

    if (accepted) lastAccept = i + 1
    if (dead)     break
    currentStates = closed
  }

  if (lastAccept === -1) return null
  return { end: lastAccept, steps }
}

// ── run ───────────────────────────────────────────────────────────────────────
function run(nfa, testString, flags = {}) {
  const global     = flags.global !== false  // default true
  const ignoreCase = !!flags.ignoreCase
  const text       = ignoreCase ? testString.toLowerCase() : testString

  const matches    = []
  const allSteps   = []
  let   pos        = 0

  while (pos <= text.length) {
    const result = matchAt(nfa, text, pos)

    if (result && result.end > pos) {
      const { end, steps } = result
      matches.push({
        start: pos,
        end,
        text:  testString.slice(pos, end),
      })
      // Tag each step with match index
      for (const step of steps) allSteps.push({ ...step, matchIndex: matches.length - 1 })

      if (!global) break
      pos = end   // advance past match (no overlapping)
    } else {
      // No match at this position — advance by one
      pos++
    }
  }

  return { matches, steps: allSteps }
}

module.exports = { run, matchAt }
