/** Default fully diluted valuation of MGV token in USD */
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface MgvFdvState {
  fdv: number
  setFdv: (value: number) => void
}

const useMgvFdvStore = create<MgvFdvState>()(
  persist(
    (set) => ({
      fdv: 1e8, // $100M default
      setFdv: (value: number) => set({ fdv: value }),
    }),
    {
      name: "mgv-fdv-storage",
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name)
          if (!str) return null
          return JSON.parse(str)
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    },
  ),
)

export const useMgvFdv = useMgvFdvStore
