import { useQuery } from "@tanstack/react-query"

import useMarket from "@/providers/market.new"
import { getErrorMessage } from "@/utils/errors"
import useKandelInstance from "./use-kandel-instance"

export function useKandelState() {
  const { currentMarket } = useMarket()
  const kandelInstance = useKandelInstance({})

  return useQuery({
    queryKey: ["kandel-state", currentMarket],
    queryFn: async () => {
      try {
        if (!currentMarket || !kandelInstance) return

        const kandelState = await kandelInstance.getKandelState()
        return kandelState
      } catch (e) {
        console.error(getErrorMessage(e))
        throw new Error("Unable to retrieve kandel state")
      }
    },
    enabled: !!currentMarket,
    meta: {
      error: "Unable to retrieve kandel state",
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}
