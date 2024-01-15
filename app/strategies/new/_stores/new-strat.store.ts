import { GeometricKandelDistribution } from "@mangrovedao/mangrove.js"
import { create, type StateCreator } from "zustand"

type OffersWithPrices = ReturnType<
  typeof GeometricKandelDistribution.prototype.getOffersWithPrices
>

export type ChangingFrom =
  | "minPrice"
  | "maxPrice"
  | "minPercentage"
  | "maxPercentage"
  | "chart"
  | "baseDeposit"
  | "quoteDeposit"
  | "pricePoints"
  | "ratio"
  | "stepSize"
  | "bountyDeposit"
  | undefined
  | null

type NewStratStore = {
  baseDeposit: string
  quoteDeposit: string
  pricePoints: string
  ratio: string
  stepSize: string
  bountyDeposit: string

  priceRange: [string, string]
  offersWithPrices?: OffersWithPrices

  isChangingFrom: ChangingFrom
  globalError?: string
  errors: Record<string, string>
}

type NewStratActions = {
  setBaseDeposit: (baseDeposit: string) => void
  setQuoteDeposit: (quoteDeposit: string) => void
  setPricePoints: (pricePoints: string) => void
  setRatio: (ratio: string) => void
  setStepSize: (stepSize: string) => void
  setBountyDeposit: (bountyDeposit: string) => void

  setPriceRange: (min: string, max: string) => void
  setOffersWithPrices: (offersWithPrices?: OffersWithPrices) => void

  setGlobalError: (error?: string) => void
  setErrors: (errors: Record<string, string>) => void
  setIsChangingFrom: (isChangingFrom: ChangingFrom) => void
}

const newStratStateCreator: StateCreator<NewStratStore & NewStratActions> = (
  set,
) => ({
  baseDeposit: "",
  quoteDeposit: "",
  pricePoints: "10",
  ratio: "",
  stepSize: "1",
  bountyDeposit: "",

  priceRange: ["", ""],
  offersWithPrices: undefined,

  isChangingFrom: null,
  globalError: undefined,
  errors: {},

  setBaseDeposit: (baseDeposit) => set({ baseDeposit }),
  setQuoteDeposit: (quoteDeposit) => set({ quoteDeposit }),
  setPricePoints: (pricePoints) => set({ pricePoints }),
  setRatio: (ratio) => set({ ratio }),
  setStepSize: (stepSize) => set({ stepSize }),
  setBountyDeposit: (bountyDeposit) => set({ bountyDeposit }),

  setPriceRange: (min, max) => set({ priceRange: [min, max] }),
  setOffersWithPrices: (offersWithPrices) => set({ offersWithPrices }),

  setGlobalError: (globalError) => set({ globalError }),
  setErrors: (errors) => set({ errors }),
  setIsChangingFrom: (isChangingFrom) => set({ isChangingFrom }),
})

export const useNewStratStore = create(newStratStateCreator)
