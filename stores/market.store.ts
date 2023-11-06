import { create } from "zustand"
import { persist } from "zustand/middleware"

export type MarketStore = {
  selectedMarket?: string
}

export type MarketActions = {
  setMarket: (market: string) => void
}

export const marketState = persist<MarketStore & MarketActions>(
  (set) => ({
    selectedMarket: undefined,
    /**
     * Actions
     */
    setMarket: (market: string) => set({ selectedMarket: market }),
  }),
  {
    name: "market",
  },
)

export const useMarket = create(marketState)
