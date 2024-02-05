import useMangrove from "@/providers/mangrove"
import { GeometricKandelInstance } from "@mangrovedao/mangrove.js"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

export function useBounty({
  stratInstance,
  bounty,
}: {
  stratInstance?: GeometricKandelInstance
  bounty: string
}) {
  const { mangrove } = useMangrove()
  return useMutation({
    mutationFn: async () => {
      try {
        if (!stratInstance) {
          throw new Error("Strategy Instance could not be fetched")
        }

        const txs = await stratInstance.populateGeneralDistribution({
          funds: bounty,
          parameters: { gasprice: mangrove?._config.gasprice },
        })

        const res = txs && (await Promise.all(txs.map((tx) => tx?.wait())))

        toast.success("Bounty added successfully")
      } catch (err) {
        console.error(err)
        toast.error("Could not add bounty")
      }
    },
    meta: {
      error: "Failed to add bounty",
    },
  })
}
