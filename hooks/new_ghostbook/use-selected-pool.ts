import { useSelectedPoolStore } from "@/stores/selected-pool.store"

/**
 * Hook to access the selected pool for market orders
 *
 * This ensures that the same pool is used between the orderbook display
 * and market order execution
 */
export function useSelectedPool() {
  const { selectedPool, setSelectedPool, clearSelectedPool } =
    useSelectedPoolStore()

  return {
    selectedPool,
    setSelectedPool,
    clearSelectedPool,
  }
}
