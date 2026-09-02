'use strict'

const app = require('./src/app')

const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
  console.log(`\n  ╔══════════════════════════════════╗`)
  console.log(`  ║   RegexLab API — port ${PORT}      ║`)
  console.log(`  ╚══════════════════════════════════╝\n`)
})
