import { create } from "zustand"
import { persist } from "zustand/middleware"

interface DisclaimerDialogState {
  isOpen: boolean
  hideDisclaimer: { [key: string]: boolean }
  setHideDisclaimer: (address: string, value: boolean) => void
  openDisclaimer: () => void
  closeDisclaimer: () => void
  checkAndShowDisclaimer: (address?: string) => boolean
}

export const useDisclaimerDialog = create<DisclaimerDialogState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      hideDisclaimer: {},
      setHideDisclaimer: (address, value) =>
        set((state) => ({
          hideDisclaimer: {
            ...state.hideDisclaimer,
            [address]: value,
          },
        })),
      openDisclaimer: () => set({ isOpen: true }),
      closeDisclaimer: () => set({ isOpen: false }),
      checkAndShowDisclaimer: (address?: string) => {
        const state = get()
        if (!state.hideDisclaimer[address ?? ""]) {
          state.openDisclaimer()
          return true
        }
        return false
      },
    }),
    {
      name: "disclaimer-dialog-storage",
      partialize: (state) => ({
        hideDisclaimer: state.hideDisclaimer,
      }),
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name)
          if (!str) return null
          return JSON.parse(str)
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    },
  ),
)
