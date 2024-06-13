import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import useKandelInstance from "@/app/strategies/(shared)/_hooks/use-kandel-instance"

export function useBounty({
  kandelInstance,
  bounty,
}: {
  kandelInstance?: ReturnType<typeof useKandelInstance>
  bounty: string
}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      try {
        if (!kandelInstance) {
          throw new Error("Strategy Instance could not be fetched")
        }

        // note: to re-implement
        // const txs = await kandelInstance.populateGeneralDistribution({
        //   funds: bounty,
        //   parameters: { gasprice: mangrove?._config.gasprice },
        // })

        // const res = txs && (await Promise.all(txs.map((tx) => tx?.wait())))

        toast.success("Bounty added successfully")
      } catch (err) {
        console.error(err)
        toast.error("Could not add bounty")
        throw new Error("Could not add bounty")
      }
    },
    meta: {
      error: "Failed to add bounty",
    },
    onSuccess() {
      try {
        queryClient.invalidateQueries({ queryKey: ["strategy-status"] })
        queryClient.invalidateQueries({ queryKey: ["strategy"] })
      } catch (error) {
        console.error(error)
      }
    },
  })
}
