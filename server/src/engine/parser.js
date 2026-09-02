'use strict'

/**
 * parser.js
 * Converts a regex pattern string into an AST.
 *
 * Supported syntax:
 *   Literals       a  b  0-9  etc.
 *   Escaped chars  \d \w \s \D \W \S \n \t \.  etc.
 *   Any char       .
 *   Char classes   [abc]  [a-z]  [^abc]
 *   Quantifiers    *  +  ?  {n}  {n,}  {n,m}
 *   Alternation    a|b
 *   Grouping       (abc)  (?:abc)
 *   Anchors        ^  $
 *
 * AST node shapes:
 *   { type: 'literal',    value: 'a' }
 *   { type: 'any' }
 *   { type: 'charClass', chars: Set, negate: bool }
 *   { type: 'concat',    children: [...] }
 *   { type: 'alternate', left, right }
 *   { type: 'repeat',    child, min, max }
 *   { type: 'group',     child, index }
 *   { type: 'anchor',    kind: 'start'|'end' }
 *   { type: 'empty' }
 */

const TOKEN = {
  LITERAL: 'LITERAL', ANY: 'ANY', CHAR_CLASS: 'CHAR_CLASS',
  STAR: 'STAR', PLUS: 'PLUS', QUESTION: 'QUESTION',
  LBRACE: 'LBRACE', RBRACE: 'RBRACE',
  PIPE: 'PIPE', LPAREN: 'LPAREN', RPAREN: 'RPAREN',
  ANCHOR_S: 'ANCHOR_S', ANCHOR_E: 'ANCHOR_E', EOF: 'EOF',
}

const ESCAPE_CLASS_CHARS = {
  d: '0123456789',
  w: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_',
  s: ' \t\n\r\f\v',
}

function expandEscapeClass(ch) {
  const lower = ch.toLowerCase()
  const chars = ESCAPE_CLASS_CHARS[lower]
  if (!chars) return null
  return { chars: new Set(chars), negate: ch !== lower }
}

function parseError(msg, pos) {
  const err = new Error(`Regex parse error at position ${pos}: ${msg}`)
  err.status = 400
  return err
}

function parseCharClass(pattern, start) {
  let i = start + 1
  const negate = pattern[i] === '^'
  if (negate) i++
  const chars = new Set()

  while (i < pattern.length && pattern[i] !== ']') {
    if (pattern[i] === '\\') {
      i++
      if (i >= pattern.length) throw parseError('Trailing backslash in []', i)
      const ch = pattern[i]
      const cls = expandEscapeClass(ch)
      if (cls) {
        for (const c of cls.chars) chars.add(c)
      } else {
        const map = { n: '\n', t: '\t', r: '\r' }
        chars.add(map[ch] ?? ch)
      }
      i++
    } else if (i + 2 < pattern.length && pattern[i + 1] === '-' && pattern[i + 2] !== ']') {
      const from = pattern[i].charCodeAt(0)
      const to   = pattern[i + 2].charCodeAt(0)
      if (from > to) throw parseError(`Invalid range ${pattern[i]}-${pattern[i+2]}`, i)
      for (let c = from; c <= to; c++) chars.add(String.fromCharCode(c))
      i += 3
    } else {
      chars.add(pattern[i++])
    }
  }

  if (i >= pattern.length) throw parseError('Unterminated character class [', start)
  return { token: { type: TOKEN.CHAR_CLASS, chars, negate }, end: i + 1 }
}

function tokenize(pattern) {
  const tokens = []
  let i = 0

  while (i < pattern.length) {
    const ch = pattern[i]

    if (ch === '\\') {
      i++
      if (i >= pattern.length) throw parseError('Trailing backslash', i - 1)
      const next = pattern[i]
      const cls = expandEscapeClass(next)
      if (cls) {
        tokens.push({ type: TOKEN.CHAR_CLASS, chars: cls.chars, negate: cls.negate })
      } else {
        const map = { n: '\n', t: '\t', r: '\r', f: '\f', v: '\v' }
        tokens.push({ type: TOKEN.LITERAL, value: map[next] ?? next })
      }
      i++; continue
    }

    if (ch === '[') {
      const { token, end } = parseCharClass(pattern, i)
      tokens.push(token); i = end; continue
    }

    // Detect non-capturing group (?:
    if (ch === '(' && pattern.slice(i, i + 3) === '(?:') {
      tokens.push({ type: TOKEN.LPAREN, nonCapture: true })
      i += 3; continue
    }

    switch (ch) {
      case '.': tokens.push({ type: TOKEN.ANY });      break
      case '*': tokens.push({ type: TOKEN.STAR });     break
      case '+': tokens.push({ type: TOKEN.PLUS });     break
      case '?': tokens.push({ type: TOKEN.QUESTION }); break
      case '|': tokens.push({ type: TOKEN.PIPE });     break
      case '(': tokens.push({ type: TOKEN.LPAREN, nonCapture: false }); break
      case ')': tokens.push({ type: TOKEN.RPAREN });   break
      case '{': tokens.push({ type: TOKEN.LBRACE });   break
      case '}': tokens.push({ type: TOKEN.RBRACE });   break
      case '^': tokens.push({ type: TOKEN.ANCHOR_S }); break
      case '$': tokens.push({ type: TOKEN.ANCHOR_E }); break
      default:  tokens.push({ type: TOKEN.LITERAL, value: ch })
    }
    i++
  }

  tokens.push({ type: TOKEN.EOF })
  return tokens
}

// ── Recursive descent parser ──────────────────────────────────────────────────

class Parser {
  constructor(tokens) {
    this.tokens   = tokens
    this.pos      = 0
    this.groupIdx = 0
  }

  peek()    { return this.tokens[this.pos] }
  consume() { return this.tokens[this.pos++] }

  expect(type) {
    const t = this.consume()
    if (t.type !== type) throw parseError(`Expected ${type} but got ${t.type}`, this.pos)
    return t
  }

  // expression = concat (| concat)*
  parseExpression() {
    let left = this.parseConcatenation()
    while (this.peek().type === TOKEN.PIPE) {
      this.consume()
      const right = this.parseConcatenation()
      left = { type: 'alternate', left, right }
    }
    return left
  }

  // concat = quantified+
  parseConcatenation() {
    const children = []
    while (true) {
      const t = this.peek().type
      if (t === TOKEN.EOF || t === TOKEN.RPAREN || t === TOKEN.PIPE) break
      children.push(this.parseQuantified())
    }
    if (children.length === 0) return { type: 'empty' }
    if (children.length === 1) return children[0]
    return { type: 'concat', children }
  }

  // quantified = atom (* | + | ? | {n,m})?
  parseQuantified() {
    const atom = this.parseAtom()
    const t = this.peek()

    if (t.type === TOKEN.STAR)     { this.consume(); return { type: 'repeat', child: atom, min: 0, max: Infinity } }
    if (t.type === TOKEN.PLUS)     { this.consume(); return { type: 'repeat', child: atom, min: 1, max: Infinity } }
    if (t.type === TOKEN.QUESTION) { this.consume(); return { type: 'repeat', child: atom, min: 0, max: 1 } }
    if (t.type === TOKEN.LBRACE)   { return this.parseCounted(atom) }
    return atom
  }

  parseCounted(atom) {
    this.consume() // {
    let n1 = ''
    while (this.peek().type === TOKEN.LITERAL && /\d/.test(this.peek().value)) n1 += this.consume().value
    if (!n1) throw parseError('Expected digit after {', this.pos)
    const min = parseInt(n1, 10)
    let max = min

    if (this.peek().type === TOKEN.LITERAL && this.peek().value === ',') {
      this.consume() // ,
      let n2 = ''
      while (this.peek().type === TOKEN.LITERAL && /\d/.test(this.peek().value)) n2 += this.consume().value
      max = n2 ? parseInt(n2, 10) : Infinity
    }

    if (this.peek().type === TOKEN.RBRACE) this.consume()
    return { type: 'repeat', child: atom, min, max }
  }

  parseAtom() {
    const t = this.peek()

    if (t.type === TOKEN.LITERAL)    { this.consume(); return { type: 'literal', value: t.value } }
    if (t.type === TOKEN.ANY)        { this.consume(); return { type: 'any' } }
    if (t.type === TOKEN.CHAR_CLASS) { this.consume(); return { type: 'charClass', chars: t.chars, negate: t.negate } }
    if (t.type === TOKEN.ANCHOR_S)   { this.consume(); return { type: 'anchor', kind: 'start' } }
    if (t.type === TOKEN.ANCHOR_E)   { this.consume(); return { type: 'anchor', kind: 'end' } }

    if (t.type === TOKEN.LPAREN) {
      this.consume()
      const isNonCapture = t.nonCapture === true
      const idx = isNonCapture ? null : ++this.groupIdx
      const child = this.parseExpression()
      this.expect(TOKEN.RPAREN)
      return { type: 'group', child, index: idx }
    }

    throw parseError(`Unexpected token type ${t.type}`, this.pos)
  }
}

function parse(pattern, flags = {}) {
  if (typeof pattern !== 'string') throw parseError('pattern must be a string', 0)
  if (pattern.length === 0) return { type: 'empty' }
  const tokens = tokenize(pattern)
  const parser = new Parser(tokens)
  const ast    = parser.parseExpression()
  if (parser.peek().type !== TOKEN.EOF) {
    throw parseError(`Unexpected token near position ${parser.pos}`, parser.pos)
  }
  return ast
}

module.exports = { parse, tokenize, TOKEN }
