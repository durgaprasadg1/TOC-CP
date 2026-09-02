'use strict'

/**
 * thompson.js
 * Builds an NFA from a parsed regex AST using Thompson's construction.
 *
 * Core idea (Thompson's construction):
 *   Every regex sub-expression maps to a "fragment" — a small NFA with
 *   exactly ONE start state and ONE accept state connected by ε-transitions.
 *   Fragments are composed recursively to build the full NFA.
 *
 * Fragment combinators:
 *   literal(c)     → [start] --c--> [accept]
 *   any()          → [start] --ANY--> [accept]
 *   concat(f1, f2) → merge f1.accept into f2.start via ε
 *   alternate(f,g) → new start --ε--> f.start, g.start
 *                    f.accept, g.accept --ε--> new accept
 *   star(f)        → new start --ε--> f.start, new accept
 *                    f.accept --ε--> f.start (loop back)
 *                    f.accept --ε--> new accept
 *                    new start --ε--> new accept (zero path)
 *   plus(f)        → concat(f, star(f))
 *   optional(f)    → alternate(f, empty)
 *
 * State IDs are integers assigned sequentially by a shared counter.
 */

// ── State ─────────────────────────────────────────────────────────────────────

class State {
  constructor(id) {
    this.id          = id
    // transitions: Map<symbol, Set<State>>
    // symbol is a string char, '' for ε, or the special ANY_SYMBOL sentinel
    this.transitions = new Map()
  }

  addTransition(symbol, target) {
    if (!this.transitions.has(symbol)) this.transitions.set(symbol, new Set())
    this.transitions.get(symbol).add(target)
  }
}

// Special sentinel meaning "matches any single character"
const ANY_SYMBOL = '\x00ANY'

// ── Fragment ──────────────────────────────────────────────────────────────────

class Fragment {
  constructor(start, accept) {
    this.start  = start   // State
    this.accept = accept  // State
  }
}

// ── NFA builder ───────────────────────────────────────────────────────────────

class NFABuilder {
  constructor() {
    this.counter  = 0
    this.states   = new Map()  // id → State
    this.alphabet = new Set()  // all non-ε symbols used
  }

  newState() {
    const s = new State(this.counter++)
    this.states.set(s.id, s)
    return s
  }

  epsilon(from, to) {
    from.addTransition('', to)
  }

  // ── Fragment factories ────────────────────────────────────────────────────

  buildEmpty() {
    const start  = this.newState()
    const accept = this.newState()
    this.epsilon(start, accept)
    return new Fragment(start, accept)
  }

  buildLiteral(char) {
    const start  = this.newState()
    const accept = this.newState()
    start.addTransition(char, accept)
    this.alphabet.add(char)
    return new Fragment(start, accept)
  }

  buildAny() {
    const start  = this.newState()
    const accept = this.newState()
    start.addTransition(ANY_SYMBOL, accept)
    // ANY_SYMBOL is not added to alphabet (handled specially in simulator)
    return new Fragment(start, accept)
  }

  buildCharClass(chars, negate) {
    // For a char class we create one state per matched char or use a
    // compact representation: store the class on the transition.
    // We store the entire Set on a special transition symbol ''.
    // The simulator will check membership.
    const start  = this.newState()
    const accept = this.newState()
    const sym    = { type: 'class', chars, negate }
    start.addTransition(sym, accept)
    return new Fragment(start, accept)
  }

  buildConcat(f1, f2) {
    // Merge f1.accept and f2.start by making f1.accept a pass-through
    // (redirect all of f2.start's transitions to f1.accept, then ε to f2.start)
    // Simpler: just ε-connect f1.accept → f2.start
    this.epsilon(f1.accept, f2.start)
    return new Fragment(f1.start, f2.accept)
  }

  buildAlternate(f1, f2) {
    const start  = this.newState()
    const accept = this.newState()
    this.epsilon(start,  f1.start)
    this.epsilon(start,  f2.start)
    this.epsilon(f1.accept, accept)
    this.epsilon(f2.accept, accept)
    return new Fragment(start, accept)
  }

  buildStar(f) {
    const start  = this.newState()
    const accept = this.newState()
    this.epsilon(start,    f.start)   // enter loop
    this.epsilon(start,    accept)    // skip (zero times)
    this.epsilon(f.accept, f.start)   // loop back
    this.epsilon(f.accept, accept)    // exit loop
    return new Fragment(start, accept)
  }

  buildPlus(f) {
    // a+ = aa* — but we reuse the same fragment for the first 'a'
    // and add a star wrapper that loops back to f.start
    const start  = this.newState()
    const accept = this.newState()
    this.epsilon(start,    f.start)
    this.epsilon(f.accept, f.start)   // loop back
    this.epsilon(f.accept, accept)    // exit
    return new Fragment(start, accept)
  }

  buildOptional(f) {
    const start  = this.newState()
    const accept = this.newState()
    this.epsilon(start,    f.start)
    this.epsilon(start,    accept)    // zero path
    this.epsilon(f.accept, accept)
    return new Fragment(start, accept)
  }

  /**
   * Expand {min, max} into a sequence of fragments.
   * e.g. a{2,4} → a a a? a?
   */
  buildCounted(childAst, min, max) {
    if (max === Infinity) {
      // Build min required, then a star for the rest
      const frags = []
      for (let i = 0; i < min; i++) frags.push(this.fromAst(childAst))
      if (min === 0) {
        // Pure star
        const f = this.fromAst(childAst)
        frags.push(this.buildStar(f))
      } else {
        const f = this.fromAst(childAst)
        frags.push(this.buildPlus(f))
      }
      return frags.reduce((acc, f) => this.buildConcat(acc, f))
    }

    // Finite: build min required + (max-min) optional
    const frags = []
    for (let i = 0; i < min; i++) frags.push(this.fromAst(childAst))
    for (let i = min; i < max; i++) {
      const f = this.fromAst(childAst)
      frags.push(this.buildOptional(f))
    }

    if (frags.length === 0) return this.buildEmpty()
    return frags.reduce((acc, f) => this.buildConcat(acc, f))
  }

  // ── AST → Fragment ────────────────────────────────────────────────────────

  fromAst(node) {
    switch (node.type) {
      case 'empty':
        return this.buildEmpty()

      case 'literal':
        return this.buildLiteral(node.value)

      case 'any':
        return this.buildAny()

      case 'charClass':
        return this.buildCharClass(node.chars, node.negate)

      case 'anchor':
        // Anchors are zero-width — treat as ε for the NFA
        return this.buildEmpty()

      case 'concat': {
        const frags = node.children.map(c => this.fromAst(c))
        return frags.reduce((acc, f) => this.buildConcat(acc, f))
      }

      case 'alternate':
        return this.buildAlternate(this.fromAst(node.left), this.fromAst(node.right))

      case 'group':
        return this.fromAst(node.child)

      case 'repeat': {
        const { min, max, child } = node
        if (min === 0 && max === Infinity) return this.buildStar(this.fromAst(child))
        if (min === 1 && max === Infinity) return this.buildPlus(this.fromAst(child))
        if (min === 0 && max === 1)        return this.buildOptional(this.fromAst(child))
        return this.buildCounted(child, min, max)
      }

      default:
        throw new Error(`Unknown AST node type: ${node.type}`)
    }
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

function build(ast) {
  const builder  = new NFABuilder()
  const fragment = builder.fromAst(ast)

  return {
    start:    fragment.start,
    accept:   fragment.accept,
    states:   builder.states,
    alphabet: builder.alphabet,
    ANY_SYMBOL,
  }
}

module.exports = { build, ANY_SYMBOL }
