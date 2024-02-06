import { GeometricKandelInstance } from "@mangrovedao/mangrove.js"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export function useWithDraw({
  stratInstance,

  volumes,
}: {
  stratInstance?: GeometricKandelInstance
  volumes: { baseAmount: string; quoteAmount: string }
}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      try {
        if (!stratInstance) {
          throw new Error("Strategy Instance could not be fetched")
        }

        const { baseAmount, quoteAmount } = volumes

        const res = await (
          await stratInstance.withdraw({
            baseAmount,
            quoteAmount,
          })
        ).wait()

        toast.success("Withdraw completed")
        return res.blockNumber
      } catch (err) {
        console.error(err)
        toast.error("Failed to withdraw")
        throw new Error("Failed to withdraw")
      }
    },
    meta: {
      error: "Failed to withdraw",
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
