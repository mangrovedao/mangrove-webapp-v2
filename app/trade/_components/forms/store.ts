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
        set({ payAmount: amount })
      },
      tradeSide: BS.buy,
      setTradeSide: (side) => {
        set({ tradeSide: side })
      },
    }),
    {
      name: "trade-form-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {},
    },
  ),
)
