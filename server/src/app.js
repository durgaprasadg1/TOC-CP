'use strict'

const express  = require('express')
const cors     = require('cors')
const morgan   = require('morgan')

const regexRoutes  = require('./routes/regex.routes')
const healthRoutes = require('./routes/health.routes')
const errorHandler = require('./middleware/errorHandler')

const app = express()

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }))
app.use(express.json({ limit: '1mb' }))
app.use(morgan('dev'))

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/health', healthRoutes)
app.use('/api/regex',  regexRoutes)

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` })
})

// Global error handler (must be last)
app.use(errorHandler)

module.exports = app
