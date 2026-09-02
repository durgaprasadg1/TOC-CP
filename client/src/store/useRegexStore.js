import { create } from 'zustand'

export const useRegexStore = create((set, get) => ({
  // Input state
  pattern: '',
  testString: '',
  flags: { global: true, ignoreCase: false, multiline: false },

  // Results from API
  nfa: null,
  dfa: null,
  parseTree: null,
  matchResults: null,
  error: null,

  // UI state
  activeTab: 'nfa',       // 'nfa' | 'dfa'
  isLoading: false,
  isDirty: false,

  // Actions
  setPattern: (pattern) => set({ pattern, isDirty: true, error: null }),
  setTestString: (testString) => set({ testString }),
  setFlags: (flags) => set((s) => ({ flags: { ...s.flags, ...flags } })),
  setActiveTab: (activeTab) => set({ activeTab }),

  setNfa: (nfa) => set({ nfa }),
  setDfa: (dfa) => set({ dfa }),
  setParseTree: (parseTree) => set({ parseTree }),
  setMatchResults: (matchResults) => set({ matchResults }),
  setError: (error) => set({ error }),
  setLoading: (isLoading) => set({ isLoading }),
  setDirty: (isDirty) => set({ isDirty }),

  reset: () => set({
    pattern: '', testString: '', nfa: null, dfa: null,
    parseTree: null, matchResults: null, error: null, isDirty: false
  }),
}))
