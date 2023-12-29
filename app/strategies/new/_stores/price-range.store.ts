import { create, type StateCreator } from "zustand"

type PriceRangeStore = {
  priceRange: [string, string]
}

type PriceRangeActions = {
  setPriceRange: (min: string, max: string) => void
}

const priceRangeStateCreator: StateCreator<
  PriceRangeStore & PriceRangeActions
> = (set) => ({
  priceRange: ["", ""],

  setPriceRange: (min: string, max: string) => set({ priceRange: [min, max] }),
})

export const usePriceRangeStore = create(priceRangeStateCreator)
