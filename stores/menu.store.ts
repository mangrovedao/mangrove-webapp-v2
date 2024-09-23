import { create, type StateCreator } from "zustand"

export type ActionButton = {
  isClosing?: boolean
}

export type MenuStore = {
  isOpen: boolean
}

export type MenuActions = {
  open: () => void
  close: () => void
  toggle: () => void
}

export const menuStateCreator: StateCreator<MenuStore & MenuActions> = (
  set,
) => ({
  isOpen: false,

  /**
   * Actions
   */
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
})

export const useMenuStore = create(menuStateCreator)
