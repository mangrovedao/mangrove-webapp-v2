import { create, type StateCreator } from "zustand"

import { OfferParsed } from "@mangrovedao/mgv"

type Store = {
  hoveredOffer?: OfferParsed
}

type Actions = {
  setHoveredOffer: (offer?: OfferParsed) => void
}

const stateCreator: StateCreator<Store & Actions> = (set, get) => ({
  hoveredOffer: undefined,

  /**
   * Actions
   */
  setHoveredOffer: (offer?: OfferParsed) => {
    set({ hoveredOffer: offer })
  },
})

export const useHoveredOfferStore = create(stateCreator)
