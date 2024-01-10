import { GeometricKandelDistribution } from "@mangrovedao/mangrove.js"
import { create, type StateCreator } from "zustand"

type OffersWithPrices = ReturnType<
  typeof GeometricKandelDistribution.prototype.getOffersWithPrices
>

type NewStratStore = {
  priceRange: [string, string]
  offersWithPrices?: OffersWithPrices
}

type NewStratActions = {
  setPriceRange: (min: string, max: string) => void
  setOffersWithPrices: (offersWithPrices?: OffersWithPrices) => void
}

const newStratStateCreator: StateCreator<NewStratStore & NewStratActions> = (
  set,
) => ({
  priceRange: ["", ""],
  offersWithPrices: undefined,

  setPriceRange: (min, max) => set({ priceRange: [min, max] }),
  setOffersWithPrices: (offersWithPrices) => set({ offersWithPrices }),
})

export const useNewStratStore = create(newStratStateCreator)
