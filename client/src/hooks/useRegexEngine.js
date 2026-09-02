import { useCallback } from 'react'
import axios from 'axios'
import { useRegexStore } from '../store/useRegexStore'
import { useSimulationStore } from '../store/useSimulationStore'

const api = axios.create({ baseURL: '/api' })

export function useRegexEngine() {
  const {
    pattern, testString, flags,
    setNfa, setDfa, setMatchResults, setError, setLoading, setDirty
  } = useRegexStore()
  const { setSteps } = useSimulationStore()

  const buildAutomata = useCallback(async () => {
    if (!pattern.trim()) return
    setLoading(true)
    setError(null)
    try {
      const [nfaRes, dfaRes] = await Promise.all([
        api.post('/regex/nfa', { pattern, flags }),
        api.post('/regex/dfa', { pattern, flags }),
      ])
      setNfa(nfaRes.data)
      setDfa(dfaRes.data)
      setDirty(false)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to build automata')
    } finally {
      setLoading(false)
    }
  }, [pattern, flags])

  const simulate = useCallback(async () => {
    if (!pattern.trim() || !testString) return
    setLoading(true)
    setError(null)
    try {
      const res = await api.post('/regex/simulate', { pattern, testString, flags })
      setMatchResults(res.data.matches)
      setSteps(res.data.steps)
    } catch (err) {
      setError(err.response?.data?.error || 'Simulation failed')
    } finally {
      setLoading(false)
    }
  }, [pattern, testString, flags])

  return { buildAutomata, simulate }
}
