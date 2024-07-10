import { Distribution, KandelParams } from "@mangrovedao/mgv"
import { create, type StateCreator } from "zustand"

export type ChangingFrom =
  | "minPrice"
  | "maxPrice"
  | "minPercentage"
  | "maxPercentage"
  | "chart"
  | "baseDeposit"
  | "quoteDeposit"
  | "numberOfOffers"
  | "stepSize"
  | "bountyDeposit"
  | "sendFrom"
  | "receiveTo"
  | undefined
  | null

export type NewStratStore = {
  baseDeposit: string
  quoteDeposit: string
  numberOfOffers: string
  stepSize: string
  bountyDeposit: string

  sendFrom: string
  receiveTo: string

  priceRange: [string, string]

  isChangingFrom: ChangingFrom
  globalError?: string
  errors: Record<string, string>

  distribution?: Distribution
  kandelParams?: KandelParams
}

type NewStratActions = {
  setBaseDeposit: (baseDeposit: string) => void
  setQuoteDeposit: (quoteDeposit: string) => void
  setNumberOfOffers: (numberOfOffers: string) => void
  setStepSize: (stepSize: string) => void
  setBountyDeposit: (bountyDeposit: string) => void
  setSendFrom: (source: string) => void
  setReceiveTo: (source: string) => void

  setPriceRange: (min: string, max: string) => void

  setGlobalError: (error?: string) => void
  setErrors: (errors: Record<string, string>) => void
  setIsChangingFrom: (isChangingFrom: ChangingFrom) => void

  setDistribution: (distribution?: Distribution) => void
  setKandelParams: (params?: KandelParams) => void
}

const newStratStateCreator: StateCreator<NewStratStore & NewStratActions> = (
  set,
) => ({
  baseDeposit: "",
  quoteDeposit: "",
  numberOfOffers: "10",
  stepSize: "1",
  bountyDeposit: "",

  sendFrom: "simple",
  receiveTo: "simple",

  priceRange: ["", ""],

  isChangingFrom: null,
  globalError: undefined,
  errors: {},

  distribution: undefined,
  kandelParams: undefined,

  setBaseDeposit: (baseDeposit) => set({ baseDeposit }),
  setQuoteDeposit: (quoteDeposit) => set({ quoteDeposit }),
  setNumberOfOffers: (numberOfOffers) => set({ numberOfOffers }),
  setStepSize: (stepSize) => set({ stepSize }),
  setBountyDeposit: (bountyDeposit) => set({ bountyDeposit }),

  setSendFrom: (sendFrom) => set({ sendFrom }),
  setReceiveTo: (receiveTo) => set({ receiveTo }),

  setPriceRange: (min, max) => set({ priceRange: [min, max] }),

  setGlobalError: (globalError) => set({ globalError }),
  setErrors: (errors) => set({ errors }),
  setIsChangingFrom: (isChangingFrom) => set({ isChangingFrom }),
  setDistribution: (distribution) => set({ distribution }),
  setKandelParams: (kandelParams) => set({ kandelParams }),
})

export const useNewStratStore = create(newStratStateCreator)
