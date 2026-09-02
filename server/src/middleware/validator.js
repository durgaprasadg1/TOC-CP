'use strict'

const { body, validationResult } = require('express-validator')

// ── Shared rules ──────────────────────────────────────────────────────────────
const patternRule = body('pattern')
  .isString().withMessage('pattern must be a string')
  .trim()
  .notEmpty().withMessage('pattern is required')
  .isLength({ max: 500 }).withMessage('pattern must be ≤ 500 characters')

const flagsRule = body('flags')
  .optional()
  .isObject().withMessage('flags must be an object')

const testStringRule = body('testString')
  .isString().withMessage('testString must be a string')
  .isLength({ max: 2000 }).withMessage('testString must be ≤ 2000 characters')

// ── Middleware factory ────────────────────────────────────────────────────────
function validate(rules) {
  return async (req, res, next) => {
    await Promise.all(rules.map(r => r.run(req)))
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error:  'Validation failed',
        issues: errors.array().map(e => ({ field: e.path, msg: e.msg })),
      })
    }
    next()
  }
}

module.exports = {
  validateBuild:    validate([patternRule, flagsRule]),
  validateSimulate: validate([patternRule, flagsRule, testStringRule]),
}
