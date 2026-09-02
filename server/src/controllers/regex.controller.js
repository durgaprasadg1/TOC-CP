'use strict'

const engine = require('../engine')

// ── Helpers ───────────────────────────────────────────────────────────────────
function engineError(message, status = 400) {
  const err = new Error(message)
  err.status = status
  return err
}

function safeRun(fn) {
  return async (req, res, next) => {
    try {
      await fn(req, res, next)
    } catch (err) {
      // Re-wrap engine errors so they always include an HTTP status
      if (!err.status) err.status = 400
      next(err)
    }
  }
}

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * POST /api/regex/parse
 * Body: { pattern, flags }
 * Returns the parsed token list for the frontend explainer panel.
 */
exports.parse = safeRun(async (req, res) => {
  const { pattern, flags = {} } = req.body
  const ast = engine.parse(pattern, flags)
  res.json({ pattern, flags, ast })
})

/**
 * POST /api/regex/nfa
 * Body: { pattern, flags }
 * Returns: { states, transitions, alphabet, startState, acceptStates }
 */
exports.buildNfa = safeRun(async (req, res) => {
  const { pattern, flags = {} } = req.body
  const nfa = engine.buildNfa(pattern, flags)
  res.json(nfa)
})

/**
 * POST /api/regex/dfa
 * Body: { pattern, flags }
 * Returns: { states, transitions, alphabet, startState, acceptStates }
 */
exports.buildDfa = safeRun(async (req, res) => {
  const { pattern, flags = {} } = req.body
  const dfa = engine.buildDfa(pattern, flags)
  res.json(dfa)
})

/**
 * POST /api/regex/simulate
 * Body: { pattern, testString, flags }
 * Returns: { matches: [{start, end, text}], steps: [{states, char, index, accepted, dead}] }
 */
exports.simulate = safeRun(async (req, res) => {
  const { pattern, testString, flags = {} } = req.body
  const result = engine.simulate(pattern, testString, flags)
  res.json(result)
})
