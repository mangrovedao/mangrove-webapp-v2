import { create, type StateCreator } from "zustand"

type NewStratStore = {
  priceRange: [string, string]
}

type NewStratActions = {
  setPriceRange: (min: string, max: string) => void
}

const newStratStateCreator: StateCreator<NewStratStore & NewStratActions> = (
  set,
) => ({
  priceRange: ["", ""],

  setPriceRange: (min: string, max: string) => set({ priceRange: [min, max] }),
})

export const useNewStratStore = create(newStratStateCreator)
