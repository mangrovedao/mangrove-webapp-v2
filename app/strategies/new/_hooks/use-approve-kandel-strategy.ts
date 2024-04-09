import { useMutation } from "@tanstack/react-query"

import useKandel from "@/app/strategies/(list)/_providers/kandel-strategies"
import useMarket from "@/providers/market"

import { getTitleDescriptionErrorMessages } from "@/utils/tx-error-messages"
import { toast } from "sonner"

export function useCreateKandelStrategy({
  setKandelAddress,
}: {
  setKandelAddress: (address: string) => void
}) {
  const { market } = useMarket()
  const { kandelStrategies } = useKandel()
  return useMutation({
    mutationFn: async () => {
      try {
        if (!(market && kandelStrategies))
          throw new Error("Failed to create strategy instance")

        const { result } = await kandelStrategies.seeder.sow({
          market,
          type: "smart",
          liquiditySharing: false,
        })

        const kandelInstance = await result

        setKandelAddress(kandelInstance.address)
        toast.success("Kandel strategy instance successfully created")
      } catch (error) {
        const { description } = getTitleDescriptionErrorMessages(error as Error)
        toast.error(description)
        console.error(error)
        throw new Error(description)
      }
    },
    meta: { disableGenericError: true },
  })
}
