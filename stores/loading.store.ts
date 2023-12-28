import { create, type StateCreator } from "zustand"

type LoadingState = "idle" | "loading"

type LoadingStore = {
  states: Record<string, LoadingState>
}

type LoadingActions = {
  startLoading: (keys: string | string[]) => void
  stopLoading: (keys: string | string[]) => void
  isLoading: (keys: string | string[]) => boolean[]
}

const loadingStateCreator: StateCreator<LoadingStore & LoadingActions> = (
  set,
  get,
) => ({
  states: {},

  /**
   * Actions
   */
  startLoading: (keys) =>
    set((state) => {
      const newStates = { ...state.states }
      ;(Array.isArray(keys) ? keys : [keys]).forEach((key) => {
        newStates[key] = "loading"
      })
      return { states: newStates }
    }),
  stopLoading: (keys) =>
    set((state) => {
      const newStates = { ...state.states }
      ;(Array.isArray(keys) ? keys : [keys]).forEach((key) => {
        newStates[key] = "idle"
      })
      return { states: newStates }
    }),
  isLoading: (keys) => {
    const state = get()
    return (Array.isArray(keys) ? keys : [keys]).map(
      (key) => state.states[key] === "loading",
    )
  },
})

export const useLoadingStore = create(loadingStateCreator)
