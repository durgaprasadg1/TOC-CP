'use strict'

const router     = require('express').Router()
const controller = require('../controllers/regex.controller')
const { validateBuild, validateSimulate } = require('../middleware/validator')

/**
 * POST /api/regex/parse
 * Returns the AST / token breakdown of a pattern.
 */
router.post('/parse', validateBuild, controller.parse)

/**
 * POST /api/regex/nfa
 * Builds an NFA via Thompson's construction and returns states + transitions.
 */
router.post('/nfa', validateBuild, controller.buildNfa)

/**
 * POST /api/regex/dfa
 * Converts NFA → DFA via subset construction and returns the result.
 */
router.post('/dfa', validateBuild, controller.buildDfa)

/**
 * POST /api/regex/simulate
 * Runs the input string through the NFA and returns matches + step trace.
 */
router.post('/simulate', validateSimulate, controller.simulate)

module.exports = router
