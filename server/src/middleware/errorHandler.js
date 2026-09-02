'use strict'

/**
 * Centralised error handler.
 * Catches all errors thrown / passed via next(err).
 */
module.exports = function errorHandler(err, req, res, next) {
  // Known regex / engine errors carry a status code
  const status  = err.status || 500
  const message = err.message || 'Internal server error'

  if (status >= 500) {
    console.error('[RegexLab]', err.stack || err)
  }

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV !== 'production' && status >= 500
      ? { stack: err.stack }
      : {}),
  })
}
