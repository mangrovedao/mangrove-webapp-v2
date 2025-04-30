import { Pool } from "@/hooks/new_ghostbook/pool"
import { create } from "zustand"

interface SelectedPoolStore {
  selectedPool: Pool | null | undefined
  setSelectedPool: (pool: Pool | null | undefined) => void
  clearSelectedPool: () => void
}

export const useSelectedPoolStore = create<SelectedPoolStore>((set) => ({
  selectedPool: undefined,
  setSelectedPool: (pool) => set({ selectedPool: pool }),
  clearSelectedPool: () => set({ selectedPool: undefined }),
}))
