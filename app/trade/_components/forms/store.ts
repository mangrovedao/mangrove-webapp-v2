import { BS } from "@mangrovedao/mgv/lib"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

interface TradeFormState {
  payAmount: string
  setPayAmount: (amount: string) => void
  tradeSide: BS
  setTradeSide: (side: BS) => void
}

export const useTradeFormStore = create<TradeFormState>()(
  persist(
    (set, get) => ({
      payAmount: "",
      setPayAmount: (amount) => {
        console.log("Setting pay amount in store:", amount)
        set({ payAmount: amount })
      },
      tradeSide: BS.buy,
      setTradeSide: (side) => {
        console.log("Setting trade side in store:", side)
        set({ tradeSide: side })
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
