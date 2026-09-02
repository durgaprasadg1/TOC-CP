import { create } from 'zustand'

export const useSimulationStore = create((set, get) => ({
  steps: [],           // Array of simulation steps from backend
  currentStep: -1,     // Index of active step
  isPlaying: false,
  speed: 600,          // ms per step

  setSteps: (steps) => set({ steps, currentStep: -1, isPlaying: false }),
  setCurrentStep: (currentStep) => set({ currentStep }),
  setPlaying: (isPlaying) => set({ isPlaying }),
  setSpeed: (speed) => set({ speed }),

  stepForward: () => {
    const { currentStep, steps } = get()
    if (currentStep < steps.length - 1)
      set({ currentStep: currentStep + 1 })
  },
  stepBack: () => {
    const { currentStep } = get()
    if (currentStep > 0) set({ currentStep: currentStep - 1 })
  },
  reset: () => set({ currentStep: -1, isPlaying: false }),
}))
