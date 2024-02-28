import { create, type StateCreator } from "zustand"

import { FormType } from "@/app/trade/_components/forms/forms"

type Store = {
  currentTab?: FormType
}

type Actions = {
  setCurrentTab: (tab?: FormType) => void
}

const stateCreator: StateCreator<Store & Actions> = (set, get) => ({
  currentTab: undefined,

  /**
   * Actions
   */
  setCurrentTab: (currentTab?: FormType) => {
    set({ currentTab })
  },
})

export const useCurrentTradeTab = create(stateCreator)
