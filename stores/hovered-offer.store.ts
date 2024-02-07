import { create, type StateCreator } from "zustand"

import { MergedOffer } from "../app/strategies/[address]/_utils/inventory"

type Store = {
  hoveredOffer?: MergedOffer
}

type Actions = {
  setHoveredOffer: (offer?: MergedOffer) => void
}

const stateCreator: StateCreator<Store & Actions> = (set, get) => ({
  hoveredOffer: undefined,

  /**
   * Actions
   */
  setHoveredOffer: (offer?: MergedOffer) => {
    set({ hoveredOffer: offer })
  },
})

export const useHoveredOfferStore = create(stateCreator)
