import { create } from "zustand"

type Store = {
  opened: boolean
}

type Actions = {
  setOpened: (opened: boolean) => void
}

export const useChangeNetworkDialogStore = create<Store & Actions>((set) => ({
  opened: false,
  setOpened: (opened) => set({ opened }),
}))
