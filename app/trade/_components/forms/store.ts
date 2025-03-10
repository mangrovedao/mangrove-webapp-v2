import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

interface TradeFormState {
  payAmount: string
  setPayAmount: (amount: string) => void
}

export const useTradeFormStore = create<TradeFormState>()(
  persist(
    (set, get) => ({
      payAmount: "",
      setPayAmount: (amount) => {
        console.log("Setting pay amount in store:", amount)
        set({ payAmount: amount })
      },
    }),
    {
      name: "trade-form-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        console.log("Rehydrated state:", state)
      },
    },
  ),
)
