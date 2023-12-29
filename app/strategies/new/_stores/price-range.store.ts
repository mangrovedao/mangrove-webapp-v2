import { create, type StateCreator } from "zustand"

type PriceRangeStore = {
  minPrice: string
  maxPrice: string
  minPercentage: string
  maxPercentage: string
}

type PriceRangeActions = {
  setMinPrice: (value: string) => void
  setMaxPrice: (value: string) => void
  setMinPercentage: (value: string) => void
  setMaxPercentage: (value: string) => void
}

const priceRangeStateCreator: StateCreator<
  PriceRangeStore & PriceRangeActions
> = (set) => ({
  minPrice: "",
  maxPrice: "",
  minPercentage: "",
  maxPercentage: "",

  setMinPrice: (value) => set({ minPrice: value }),
  setMaxPrice: (value) => set({ maxPrice: value }),
  setMinPercentage: (value) => set({ minPercentage: value }),
  setMaxPercentage: (value) => set({ maxPercentage: value }),
})

export const usePriceRangeStore = create(priceRangeStateCreator)
