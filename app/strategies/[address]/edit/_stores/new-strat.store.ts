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
  | "sendFrom"
  | "receiveTo"
  | undefined
  | null

export type NewStratStore = {
  baseDeposit: string
  quoteDeposit: string
  pricePoints: string
  ratio: string
  stepSize: string
  bountyDeposit: string

  sendFrom: string
  receiveTo: string

  priceRange: [string, string]
  offersWithPrices?: OffersWithPrices

  isChangingFrom: ChangingFrom
  globalError?: string
  errors: Record<string, string>

  distribution?: GeometricKandelDistribution
}

type NewStratActions = {
  setBaseDeposit: (baseDeposit: string) => void
  setQuoteDeposit: (quoteDeposit: string) => void
  setPricePoints: (pricePoints: string) => void
  setRatio: (ratio: string) => void
  setStepSize: (stepSize: string) => void
  setBountyDeposit: (bountyDeposit: string) => void
  setSendFrom: (source: string) => void
  setReceiveTo: (source: string) => void

  setPriceRange: (min: string, max: string) => void
  setOffersWithPrices: (offersWithPrices?: OffersWithPrices) => void

  setGlobalError: (error?: string) => void
  setErrors: (errors: Record<string, string>) => void
  setIsChangingFrom: (isChangingFrom: ChangingFrom) => void

  setDistribution: (distribution?: GeometricKandelDistribution) => void
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

  sendFrom: "",
  receiveTo: "",

  priceRange: ["", ""],
  offersWithPrices: undefined,

  isChangingFrom: null,
  globalError: undefined,
  errors: {},

  distribution: undefined,

  setBaseDeposit: (baseDeposit) => set({ baseDeposit }),
  setQuoteDeposit: (quoteDeposit) => set({ quoteDeposit }),
  setPricePoints: (pricePoints) => set({ pricePoints }),
  setRatio: (ratio) => set({ ratio }),
  setStepSize: (stepSize) => set({ stepSize }),
  setBountyDeposit: (bountyDeposit) => set({ bountyDeposit }),

  setSendFrom: (sendFrom) => set({ sendFrom }),
  setReceiveTo: (receiveTo) => set({ receiveTo }),

  setPriceRange: (min, max) => set({ priceRange: [min, max] }),
  setOffersWithPrices: (offersWithPrices) => set({ offersWithPrices }),

  setGlobalError: (globalError) => set({ globalError }),
  setErrors: (errors) => set({ errors }),
  setIsChangingFrom: (isChangingFrom) => set({ isChangingFrom }),
  setDistribution: (distribution) => set({ distribution }),
})

export const useNewStratStore = create(newStratStateCreator)
