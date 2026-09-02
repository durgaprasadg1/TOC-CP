'use strict'

const router = require('express').Router()

router.get('/', (req, res) => {
  res.json({
    status:  'ok',
    service: 'RegexLab API',
    version: '1.0.0',
    uptime:  Math.floor(process.uptime()),
    ts:      new Date().toISOString(),
  })
})

module.exports = router
