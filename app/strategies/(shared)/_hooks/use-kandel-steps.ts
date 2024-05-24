import { KandelSeederActions } from "@mangrovedao/mgv"
import { useQuery } from "@tanstack/react-query"

import { getErrorMessage } from "@/utils/errors"
import { Address } from "viem"
import { useAccount } from "wagmi"

export function useKandelSteps({ seeder }: { seeder?: KandelSeederActions }) {
  const { address } = useAccount()

  return useQuery({
    queryKey: ["kandelSteps", seeder],
    queryFn: async () => {
      try {
        if (!seeder || !address) return
        const currentSteps = await seeder.getKandelSteps({
          user: address as Address,
          userRouter: address as Address,
        })
        return currentSteps
      } catch (e) {
        console.error(getErrorMessage(e))
        throw new Error("Unable to retrieve kandel steps")
      }
    },
    enabled: !!seeder,
    meta: {
      error: "Unable to retrieve kandel steps",
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}
